import fs from 'fs';
import path from 'path';
import { createAdminClient } from '../lib/db/supabase-admin';

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.pdf':
      return 'application/pdf';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default:
      return 'application/octet-stream';
  }
}

interface ImageInspection {
  exists: boolean;
  filePath: string;
  ext: string;
  mimeType: string;
  sizeMB: number;
  isWithinLimit: boolean;
}

function inspectImageFile(filePath: string, limitMB: number): ImageInspection {
  const exists = fs.existsSync(filePath);
  if (!exists) {
    return {
      exists: false,
      filePath,
      ext: path.extname(filePath).toLowerCase() || 'N/A',
      mimeType: 'N/A',
      sizeMB: 0,
      isWithinLimit: true
    };
  }

  const stats = fs.statSync(filePath);
  const sizeMB = Number((stats.size / (1024 * 1024)).toFixed(2));
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = getMimeType(filePath);
  const isWithinLimit = sizeMB <= limitMB;

  return {
    exists: true,
    filePath,
    ext,
    mimeType,
    sizeMB,
    isWithinLimit
  };
}

async function migrateData() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`=== MIGRATION SCRIPT INITIALIZED (Mode: ${isDryRun ? 'DRY-RUN' : 'LIVE MUTATION'}) ===\n`);

  const summary = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    uploaded: 0,
    skippedGalleryItems: [] as string[],
    errors: [] as string[]
  };

  const supabase = createAdminClient();
  const defaultSlug = process.env.DEFAULT_SCHOOL_SLUG || 'snlhs';

  // --------------------------------------------------------------------------
  // 1. SCHOOL & SETTINGS IMPORT
  // --------------------------------------------------------------------------
  let school: any = null;
  try {
    const schoolJsonPath = path.join(process.cwd(), 'data', 'school.json');
    let schoolJson: any = {};
    if (fs.existsSync(schoolJsonPath)) {
      schoolJson = JSON.parse(fs.readFileSync(schoolJsonPath, 'utf8'));
    }

    const newSettingsPayload = {
      motto: schoolJson.motto || 'শিক্ষা • শৃঙ্খলা • চরিত্র',
      established: schoolJson.established || '১৯৯৮',
      principal_message: 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুলে আপনাকে স্বাগতম। আমরা উন্নত শিক্ষা ও নীতি-নৈতিকতার মাধ্যমে শিক্ষার্থীদের ভবিষ্যৎ গড়ি।',
      stats: schoolJson.stats || []
    };

    const { data: existingSchools } = await supabase
      .from('schools')
      .select('*')
      .eq('slug', defaultSlug)
      .limit(1);

    const existingSchool = existingSchools?.[0] || null;

    if (!existingSchool) {
      console.log(`[${isDryRun ? 'DRY-RUN WOULD INSERT' : 'INSERT'}] School (${defaultSlug})...`);
      if (!isDryRun) {
        const { data: newSchool, error } = await supabase.from('schools').insert({
          name: schoolJson.nameBn || 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল',
          slug: defaultSlug,
          address: schoolJson.address || 'ঢাকা, বাংলাদেশ',
          phone: schoolJson.phone || '01531927956',
          email: schoolJson.email || 'snlhs07@gmail.com',
          status: 'active',
          settings: newSettingsPayload
        }).select().single();

        if (error) throw error;
        school = newSchool;
        summary.inserted++;
      } else {
        school = { id: 'dummy-school-id', name: 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল', settings: {} };
        summary.inserted++;
      }
    } else {
      school = existingSchool;
      const mergedSettings = { ...(existingSchool.settings || {}), ...newSettingsPayload };

      console.log(`[${isDryRun ? 'DRY-RUN WOULD UPDATE' : 'UPDATE'}] School Settings for ID: ${school.id}`);
      if (!isDryRun) {
        const { error } = await supabase.from('schools').update({
          settings: mergedSettings
        }).eq('id', school.id);
        if (error) throw error;
      }
      summary.updated++;
    }
  } catch (err: any) {
    summary.errors.push(`School section error: ${err.message}`);
    console.error('School Error:', err.message);
  }

  if (!school) {
    console.error('School not found/created. Aborting migration.');
    return;
  }

  const schoolId = school.id;

  // --------------------------------------------------------------------------
  // 2. EXPLICIT RESET OF FAKE ATTACHMENT URLS IN NOTICES TABLE
  // --------------------------------------------------------------------------
  try {
    console.log(`[${isDryRun ? 'DRY-RUN WOULD RESET' : 'RESET'}] Setting attachment_url = null & attachment_original_name = null in notices...`);
    if (!isDryRun) {
      const { error } = await supabase
        .from('notices')
        .update({ attachment_url: null, attachment_original_name: null, attachment_type: null })
        .eq('school_id', schoolId);
      if (error) throw error;
    }
    summary.updated++;
  } catch (err: any) {
    summary.errors.push(`Notice attachment reset error: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // 3. IDEMPOTENT NOTICES MIGRATION (from data/notices.json)
  // --------------------------------------------------------------------------
  try {
    const noticesPath = path.join(process.cwd(), 'data', 'notices.json');
    if (fs.existsSync(noticesPath)) {
      const rawNotices = JSON.parse(fs.readFileSync(noticesPath, 'utf8'));
      const dateMap: Record<number, string> = {
        1: '2026-08-15',
        2: '2026-08-10',
        3: '2026-08-12',
        4: '2026-08-05'
      };

      for (const n of rawNotices) {
        const { data: noticesList } = await supabase
          .from('notices')
          .select('id, attachment_url')
          .eq('school_id', schoolId)
          .eq('title', n.title)
          .limit(1);

        const existingNotice = noticesList?.[0] || null;

        const noticePayload = {
          school_id: schoolId,
          title: n.title,
          description: n.summary || n.description || '',
          category: n.category || 'সাধারণ',
          pub_date: dateMap[n.id] || new Date().toISOString().split('T')[0],
          attachment_url: null,
          attachment_original_name: null,
          attachment_type: null,
          is_published: true
        };

        if (existingNotice) {
          console.log(`[${isDryRun ? 'DRY-RUN WOULD UPDATE' : 'UPDATE'}] Notice ID ${existingNotice.id}: "${n.title}"`);
          if (!isDryRun) {
            const { error } = await supabase.from('notices').update(noticePayload).eq('id', existingNotice.id);
            if (error) throw error;
          }
          summary.updated++;
        } else {
          console.log(`[${isDryRun ? 'DRY-RUN WOULD INSERT' : 'INSERT'}] Notice: "${n.title}"`);
          if (!isDryRun) {
            const { error } = await supabase.from('notices').insert(noticePayload);
            if (error) throw error;
          }
          summary.inserted++;
        }
      }
    }
  } catch (err: any) {
    summary.errors.push(`Notices section error: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // 4. TEACHERS MIGRATION & AUTHENTIC IMAGE UPLOAD (from data/teachers.json)
  // --------------------------------------------------------------------------
  try {
    const teachersPath = path.join(process.cwd(), 'data', 'teachers.json');
    if (fs.existsSync(teachersPath)) {
      const rawTeachers = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));

      for (const [index, t] of rawTeachers.entries()) {
        const { data: teacherList } = await supabase
          .from('teachers')
          .select('id, photo_url')
          .eq('school_id', schoolId)
          .eq('name', t.name)
          .order('updated_at', { ascending: false });

        const existingTeacher = teacherList?.[0] || null;

        if (teacherList && teacherList.length > 1 && !isDryRun) {
          const duplicateIds = teacherList.slice(1).map(item => item.id);
          console.log(`[CLEANUP] Removing ${duplicateIds.length} duplicate teacher rows for "${t.name}"...`);
          await supabase.from('teachers').delete().in('id', duplicateIds);
        }

        let finalPhotoUrl: string | null = null;

        const teacherImageRelative = t.image || '';
        const candidates = [
          path.join(process.cwd(), teacherImageRelative),
          path.join(process.cwd(), 'assets', 'images', 'principal.jpg')
        ];

        let authenticFileFound: string | null = null;
        if (t.id === 1 && fs.existsSync(candidates[1])) {
          authenticFileFound = candidates[1];
        } else if (teacherImageRelative && fs.existsSync(candidates[0])) {
          authenticFileFound = candidates[0];
        }

        if (authenticFileFound) {
          const inspection = inspectImageFile(authenticFileFound, 5.0);

          console.log(`\n  [FILE INSPECTION] Teacher (${t.name}):`);
          console.log(`  - Exists: ${inspection.exists}`);
          console.log(`  - Source Path: ${inspection.filePath}`);
          console.log(`  - Extension: ${inspection.ext}`);
          console.log(`  - Dynamic MIME: ${inspection.mimeType}`);
          console.log(`  - Size: ${inspection.sizeMB} MB (Limit: 5.0 MB, OK: ${inspection.isWithinLimit})`);

          if (existingTeacher?.photo_url && !existingTeacher.photo_url.startsWith('assets/')) {
            console.log(`  [SKIP UPLOAD] Photo already set in Storage for ${t.name}: ${existingTeacher.photo_url}`);
            finalPhotoUrl = existingTeacher.photo_url;
            summary.skipped++;
          } else if (inspection.exists && inspection.isWithinLimit) {
            const ext = inspection.ext;
            const relativeStoragePath = `${schoolId}/teachers/${Date.now()}_teacher_${t.id}${ext}`;
            console.log(`  [${isDryRun ? 'DRY-RUN WOULD UPLOAD' : 'UPLOAD'}] ${authenticFileFound} -> teacher-images:${relativeStoragePath} (${inspection.mimeType})`);

            if (!isDryRun) {
              const fileBuffer = fs.readFileSync(authenticFileFound);
              const { error: uploadErr } = await supabase.storage
                .from('teacher-images')
                .upload(relativeStoragePath, fileBuffer, {
                  contentType: inspection.mimeType,
                  upsert: true
                });

              if (uploadErr) {
                summary.errors.push(`Teacher photo upload error: ${uploadErr.message}`);
              } else {
                finalPhotoUrl = relativeStoragePath;
                summary.uploaded++;
              }
            } else {
              finalPhotoUrl = relativeStoragePath;
              summary.uploaded++;
            }
          }
        } else {
          console.log(`  [NO LOCAL IMAGE FILE] ${t.name}: No authentic file on disk -> photo_url set to null`);
        }

        const teacherPayload = {
          school_id: schoolId,
          name: t.name,
          designation: t.designation || 'শিক্ষক',
          department: t.department || 'সাধারণ',
          subject: t.qualification || '',
          photo_url: finalPhotoUrl,
          display_order: index + 1,
          is_published: true
        };

        if (existingTeacher) {
          console.log(`[${isDryRun ? 'DRY-RUN WOULD UPDATE' : 'UPDATE'}] Teacher ID ${existingTeacher.id}: "${t.name}" (photo_url: ${finalPhotoUrl || 'null'})`);
          if (!isDryRun) {
            const { error } = await supabase.from('teachers').update(teacherPayload).eq('id', existingTeacher.id);
            if (error) throw error;
          }
          summary.updated++;
        } else {
          console.log(`[${isDryRun ? 'DRY-RUN WOULD INSERT' : 'INSERT'}] Teacher: "${t.name}" (photo_url: ${finalPhotoUrl || 'null'})`);
          if (!isDryRun) {
            const { error } = await supabase.from('teachers').insert(teacherPayload);
            if (error) throw error;
          }
          summary.inserted++;
        }
      }
    }
  } catch (err: any) {
    summary.errors.push(`Teachers section error: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // 5. EVENTS MIGRATION (from data/events.json - 3 items)
  // --------------------------------------------------------------------------
  try {
    const eventsPath = path.join(process.cwd(), 'data', 'events.json');
    if (fs.existsSync(eventsPath)) {
      const rawEvents = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
      const eventDateMap: Record<number, string> = {
        1: '2026-02-20',
        2: '2026-03-15',
        3: '2026-02-21'
      };

      for (const e of rawEvents) {
        const { data: eventList } = await supabase
          .from('events')
          .select('id')
          .eq('school_id', schoolId)
          .eq('title', e.title)
          .limit(1);

        const existingEvent = eventList?.[0] || null;

        const eventPayload = {
          school_id: schoolId,
          title: e.title,
          description: e.summary || '',
          event_date: eventDateMap[e.id] || '2026-02-20',
          location: 'বিদ্যালয় প্রাঙ্গণ',
          featured_image: null,
          is_featured: e.id === 1,
          is_published: true
        };

        if (existingEvent) {
          console.log(`[${isDryRun ? 'DRY-RUN WOULD UPDATE' : 'UPDATE'}] Event ID ${existingEvent.id}: "${e.title}"`);
          if (!isDryRun) {
            const { error } = await supabase.from('events').update(eventPayload).eq('id', existingEvent.id);
            if (error) throw error;
          }
          summary.updated++;
        } else {
          console.log(`[${isDryRun ? 'DRY-RUN WOULD INSERT' : 'INSERT'}] Event: "${e.title}"`);
          if (!isDryRun) {
            const { error } = await supabase.from('events').insert(eventPayload);
            if (error) throw error;
          }
          summary.inserted++;
        }
      }
    }
  } catch (err: any) {
    summary.errors.push(`Events section error: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // 6. GALLERY ALBUMS & IMAGES (Conditional: Only insert album if uploadable image exists)
  // --------------------------------------------------------------------------
  try {
    const galleryPath = path.join(process.cwd(), 'data', 'gallery.json');
    if (fs.existsSync(galleryPath)) {
      const rawGallery = JSON.parse(fs.readFileSync(galleryPath, 'utf8'));

      const categoryAlbumMap: Record<string, { title: string; description: string }> = {
        sports: { title: 'ক্রীড়া গ্যালারি', description: 'বিদ্যালয়ের বার্ষিক ক্রীড়া প্রতিযোগিতা ও খেলাধুলার ছবি সমুহ' },
        science: { title: 'বিজ্ঞান মেলা গ্যালারি', description: 'বিজ্ঞান মেলা ও উদ্ভাবনী রোবোটিক্স প্রদর্শনীর ছবি সমুহ' },
        cultural: { title: 'সাংস্কৃতিক অনুষ্ঠান গ্যালারি', description: 'জাতীয় দিবস, সাংস্কৃতিক অনুষ্ঠান ও পুরস্কার বিতরণীর ছবি সমুহ' },
        campus: { title: 'ক্যাম্পাস ও পরিবেশ গ্যালারি', description: 'বিদ্যালয়ের সুসজ্জিত প্রাঙ্গণ ও সুসংগঠিত ল্যাবের ছবি সমুহ' }
      };

      const albumCache: Record<string, string> = {};

      for (const [index, item] of rawGallery.entries()) {
        const catKey = item.category || 'cultural';
        const albumInfo = categoryAlbumMap[catKey] || { title: 'সাধারণ গ্যালারি', description: 'বিদ্যালয়ের ছবির অ্যালবাম' };

        const sourceImagePath = path.join(process.cwd(), item.image || '');
        const inspection = inspectImageFile(sourceImagePath, 10.0);

        console.log(`\n  [FILE INSPECTION] Gallery Item ${item.id} ("${item.title}"):`);
        console.log(`  - Exists: ${inspection.exists}`);
        console.log(`  - Path in JSON: ${item.image}`);
        console.log(`  - Disk Path: ${inspection.filePath}`);
        console.log(`  - Extension: ${inspection.ext}`);
        console.log(`  - Size: ${inspection.sizeMB} MB`);

        // Strict rule: Skip image row AND do not create album if no valid source file exists!
        if (!inspection.exists) {
          console.log(`  [SKIP ROW & ALBUM] No valid source file on disk -> Skipping gallery item and album creation for "${item.title}"`);
          summary.skipped++;
          summary.skippedGalleryItems.push(`Item ${item.id} ("${item.title}") - File missing: ${item.image}`);
          continue;
        }

        // Only executed if at least 1 authentic uploadable file exists on disk:
        if (!albumCache[catKey]) {
          const { data: albumList } = await supabase
            .from('gallery_albums')
            .select('id')
            .eq('school_id', schoolId)
            .eq('title', albumInfo.title)
            .limit(1);

          let album = albumList?.[0] || null;

          if (!album) {
            console.log(`[${isDryRun ? 'DRY-RUN WOULD INSERT ALBUM' : 'INSERT ALBUM'}] Album: "${albumInfo.title}"`);
            if (!isDryRun) {
              const { data: newAlbum, error: albumErr } = await supabase
                .from('gallery_albums')
                .insert({
                  school_id: schoolId,
                  title: albumInfo.title,
                  description: albumInfo.description,
                  cover_image: null,
                  is_published: true
                })
                .select('id')
                .single();

              if (albumErr) throw albumErr;
              album = newAlbum;
              summary.inserted++;
            } else {
              album = { id: `dummy-album-${catKey}` };
              summary.inserted++;
            }
          }
          albumCache[catKey] = album.id;
        }

        const albumId = albumCache[catKey];
        const relativeStoragePath = `${schoolId}/gallery/${Date.now()}_gallery_${item.id}${inspection.ext}`;
        console.log(`  [${isDryRun ? 'DRY-RUN WOULD UPLOAD' : 'UPLOAD'}] ${inspection.filePath} -> gallery-images:${relativeStoragePath} (${inspection.mimeType})`);

        if (!isDryRun) {
          const fileBuffer = fs.readFileSync(inspection.filePath);
          const { error: gUploadErr } = await supabase.storage
            .from('gallery-images')
            .upload(relativeStoragePath, fileBuffer, {
              contentType: inspection.mimeType,
              upsert: true
            });

          if (gUploadErr) {
            summary.errors.push(`Gallery image upload error ${item.id}: ${gUploadErr.message}`);
          } else {
            summary.uploaded++;
          }
        } else {
          summary.uploaded++;
        }

        const { data: galleryImgList } = await supabase
          .from('gallery_images')
          .select('id')
          .eq('school_id', schoolId)
          .eq('album_id', albumId)
          .eq('caption', item.title)
          .limit(1);

        const existingGalleryImg = galleryImgList?.[0] || null;

        const imagePayload = {
          school_id: schoolId,
          album_id: albumId,
          image_url: relativeStoragePath,
          caption: item.title,
          display_order: index + 1
        };

        if (existingGalleryImg) {
          console.log(`[${isDryRun ? 'DRY-RUN WOULD UPDATE' : 'UPDATE'}] Gallery Image ID ${existingGalleryImg.id}: "${item.title}"`);
          if (!isDryRun) {
            const { error } = await supabase.from('gallery_images').update(imagePayload).eq('id', existingGalleryImg.id);
            if (error) throw error;
          }
          summary.updated++;
        } else {
          console.log(`[${isDryRun ? 'DRY-RUN WOULD INSERT' : 'INSERT'}] Gallery Image: "${item.title}" into Album ID ${albumId}`);
          if (!isDryRun) {
            const { error } = await supabase.from('gallery_images').insert(imagePayload);
            if (error) throw error;
          }
          summary.inserted++;
        }
      }
    }
  } catch (err: any) {
    summary.errors.push(`Gallery section error: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n============================================================');
  console.log(`  MIGRATION SUMMARY REPORT (${isDryRun ? 'DRY-RUN' : 'LIVE MUTATION'})`);
  console.log('============================================================');
  console.log(`  • Rows Inserted: ${summary.inserted}`);
  console.log(`  • Rows Updated:  ${summary.updated}`);
  console.log(`  • Rows Skipped:  ${summary.skipped}`);
  console.log(`  • Files Uploaded:${summary.uploaded}`);
  console.log(`  • Total Errors:  ${summary.errors.length}`);
  if (summary.skippedGalleryItems.length > 0) {
    console.log('\n  SKIPPED GALLERY ITEMS (No album created / no image inserted):');
    summary.skippedGalleryItems.forEach((item, idx) => console.log(`  ${idx + 1}. ${item}`));
  }
  if (summary.errors.length > 0) {
    console.log('\n  ERRORS DETECTED:');
    summary.errors.forEach((err, idx) => console.log(`  ${idx + 1}. ${err}`));
  }
  console.log('============================================================\n');
}

migrateData().catch(err => {
  console.error('Migration execution error:', err);
});
