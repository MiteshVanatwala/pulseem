export const appearance = {
  panels: {
    dock: 'right'
  }
}
export const tools = {
  html: {
    enabled: true
  },
  social: {
    enabled: true
  },
  timer: {
    enabled: true
  },
  video: {
    enabled: true
  },
  form: {
    enabled: true,
    usageLimit: 1,
    properties: {
      fields: { // Put pulseem defaults here
        editor: {
          data: {
            defaultFields: [
              { name: "birthday", label: "Birthday", type: "date" },
              { name: "company", label: "Company", type: "text" },
              { name: "email", label: "Email", type: "email" },
              { name: "first_name", label: "First Name", type: "text" },
              { name: "last_name", label: "Last Name", type: "text" },
              { name: "phone_number", label: "Phone Number", type: "text" },
              { name: "website", label: "Website", type: "text" },
              { name: "zip_code", label: "Zip Code", type: "text" }
            ]
          }
        }
      },
      action: {
        editor: {
          data: {
            actions: [
              {
                label: 'Marketing',
                method: 'POST',
                url: 'http://whatever.com/marketing-form-submission',
              },
              {
                label: 'Sales',
                method: 'POST',
                target: '_blank',
                url: 'http://whatever.com/sales-form-submission',
              }
            ]
          }
        }
      }
    }
  },
  image: {
    position: 1,
    enabled: true
  }
};
export const options = {
  amp: true,
  user: {
    id: -1,
    name: "",
    email: "",
  },
  locale: "he-IL",
  translations:
  {
    'he-IL': {
      "buttons.add_column": "הוסף עמודה",
      "buttons.add_content": "הוסף תוכן",
      "buttons.add_display_condition": "Add Display Condition",
      "buttons.add_field": "הוסף שדה",
      "buttons.add_new_field": "הוסף שדה חדש",
      "buttons.add_new_item": "הוסף מבנה נוסף",
      "buttons.add_row": "הוסף שורה",
      "buttons.add_text": "הוסף טקסט",
      "buttons.apply": "החל",
      "buttons.apply_effects": "החלת אפקטים ועוד",
      "buttons.back": "חזור",
      "buttons.background": "רקע",
      "buttons.cancel": "ביטול",
      "buttons.change": "שינוי",
      "buttons.change_image": "שנה תמונה",
      "buttons.close": "סגור",
      "buttons.comment": "תגובה",
      "buttons.corners": "קרנות",
      "buttons.crop": "חתוך",
      "buttons.delete": "מחק",
      "buttons.deselect": "בטל בחירה",
      "buttons.desktop": "דסקטופ",
      "buttons.done": "סיום",
      "buttons.draw": "צייר",
      "buttons.drawing": "ציור",
      "buttons.duplicate": "שכפול",
      "buttons.duplication_disabled_usage_limit": "לא ניתן לבצע שכפולים נוספים",
      "buttons.edit": "עריכה",
      "buttons.filter": "סינון",
      "buttons.frame": "מסגרת",
      "buttons.history": "הסטוריה",
      "buttons.merge": "מיזוג",
      "buttons.mobile": "נייד",
      "buttons.more_options": "אפשרויות נוספות",
      "buttons.open": "פתיחה",
      "buttons.remove_column": "הסר עמודה",
      "buttons.reset": "אתחול",
      "buttons.reset_value": "אתחל ערך",
      "buttons.resize": "שנה מידה",
      "buttons.save": "שמירה",
      "buttons.select": "בחירה",
      "buttons.shape": "תבנית",
      "buttons.shapes": "תבניות",
      "buttons.show_fewer_options": "הצג פחות אפשרויות",
      "buttons.show_more_options": "הצג אפרשרויות נוספות",
      "buttons.sticker": "סטיקר",
      "buttons.stickers": "סטיקרים",
      "buttons.tablet": "טאבלט",
      "buttons.transform": "שנה מבנה",
      "buttons.update_field": "עדכן שדה",
      "buttons.upload": "העלאה",
      "buttons.upload_image": "העלה תמונה",
      "buttons.zoom": "זום",
      "collaboration.add_comment": "הוסף תגובה",
      "collaboration.empty.subtitle": "Your threads here",
      "collaboration.empty.title": "Team collaboration made easy!",
      "collaboration.empty_filtered.subtitle": "matching your filters",
      "collaboration.empty_filtered.title": "No threads found",
      "collaboration.exit_mode": "סגור תגובות",
      "collaboration.filters.all": "הכל",
      "collaboration.filters.only_yours": "שלך בלבד",
      "collaboration.filters.resolved": "נפתר",
      "collaboration.follow_docs_to_setup": "Follow the docs to setup team collaboration",
      "collaboration.leave_repply": "השאר תגובה",
      "collaboration.login_to_collaborate": "You need to be logged in to be able to collaborate",
      "collaboration.panel.threads": "Threads",
      "collaboration.replies.one": "תגובה אחת",
      "collaboration.replies.n": "{n} תגובות",
      "collaboration.replies.none": "אין תגובות",
      "collaboration.resolve": "Resolve",
      "collaboration.resolved": "Resolved",
      "collaboration.types.feedback": "Feedback",
      "collaboration.types.idea": "Idea",
      "collaboration.types.question": "שאלה",
      "collaboration.types.urgent": "דחוף",
      "colors.black": "שחור",
      "colors.ruby": "אדמדם",
      "colors.white": "לבן",
      "content_tools.button": "כפתור",
      "content_tools.columns": "עמודות",
      "content_tools.divider": "קו מפריד",
      "content_tools.form": "טופס",
      "content_tools.heading": "כותרת",
      "content_tools.html": "HTML",
      "content_tools.image": "תמונה",
      "content_tools.menu": "תפריט",
      "content_tools.social": "רשתות חברתיות",
      "content_tools.text": "טקסט",
      "content_tools.timer": "שעון עצר",
      "content_tools.video": "וידאו",
      "editor.action_type.label": "סוג פעולה",
      "editor.align.label": "יישר",
      "editor.alignment.label": "יישור",
      "editor.all_sides.label": "כל הצדדים",
      "editor.alternate_text.label": "Alternate Text",
      "editor.anchor.section_already_exists": "קיים כבר קטע עם שם זה",
      "editor.background_color.label": "צבע רקע",
      "editor.background_image.center": "מרכז",
      "editor.background_image.cover_mode": "Cover Mode",
      "editor.background_image.full_width": "כל הרוחב",
      "editor.background_image.label": "תמונת רקע",
      "editor.background_image.repeat": "בצע שוב",
      "editor.border.dashed": "Dashed",
      "editor.border.dotted": "מקווקוו",
      "editor.border.label": "גבול",
      "editor.border.solid": "מלא",
      "editor.bottom.label": "למטה",
      "editor.bottom_left.label": "שמאל תחתון",
      "editor.bottom_right.label": "ימין תחתון",
      "editor.button_link.label": "קישור בכפתור",
      "editor.color.label": "צבע",
      "editor.colors.label": "צבעים",
      "editor.columns_background.label": "רקע עמודה",
      "editor.container_padding.label": "ריווח מבנה",
      "editor.content_alignment.label": "יישור תוכן",
      "editor.content_background_color.label": "צבע רקע תוכן",
      "editor.content_width.label": "רוחב תוכן",
      "editor.digits_color.label": "צבע ספרות",
      "editor.digits_font.label": "גודל פונט ספרות",
      "editor.digits_font_size.label": "גודל פונט",
      "editor.do_not_stack_on_mobile.label": "לא להציג במובייל",
      "editor.end_time.label": "זמן סיום",
      "editor.fields.label": "שדות",
      "editor.font_family.label": "משפחת פונטים",
      "editor.font_size.label": "גודל פונט",
      "editor.form.custom": "Custom",
      "editor.form.method": "Method",
      "editor.form_alignment.label": "יישור טופס",
      "editor.form_width.label": "רוחב הטופס",
      "editor.full_width.label": "רוחב מירבי",
      "editor.heading_type.label": "סוג כותרת",
      "editor.height.label": "גובה",
      "editor.hide_on_desktop.label": "הסתר בדסקטופ",
      "editor.hide_on_mobile.label": "הסתר בנייד",
      "editor.hover_background.label": "Hover Background",
      "editor.hover_color.label": "צבע במעבר עכבר",
      "editor.hover_text.label": "טקסט במעבר עכשיו",
      "editor.hover_underline.label": "קו תחתון במעבר עכבר",
      "editor.icon_spacing.label": "ריווח אייקונים",
      "editor.icon_type.label": "סוג אייקון",
      "editor.image.added_drawing": "Added: drawing",
      "editor.image.added_frame": "Added: frame",
      "editor.image.added_overlay_image": "Added: overlay image",
      "editor.image.added_shape": "Added: shape",
      "editor.image.added_sticker": "Added: sticker",
      "editor.image.added_text": "Added: text",
      "editor.image.applied_crop": "Applied: crop",
      "editor.image.applied_filter": "Applied: filter",
      "editor.image.applied_resize": "Applied: resize",
      "editor.image.applied_rounded_corners": "Applied: rounded corners",
      "editor.image.applied_transform": "Applied: transform",
      "editor.image.auto": "אטוטומטי",
      "editor.image.auto_width": "רוחב אוטומטי",
      "editor.image.auto_width_switch_off": "בטל התאמת גודל אוטומאטית",
      "editor.image.brush_color": "צבע מברשת",
      "editor.image.brush_size": "גודל מברשת",
      "editor.image.brush_type": "סוג מברשת",
      "editor.image.canvas_background": "רקע קנבס",
      "editor.image.changed_background": "Changed: background",
      "editor.image.changed_background_image": "Changed: background image",
      "editor.image.changed_style": "Changed: style",
      "editor.image.drop_upload": "גרור תמונה לפה או העלה מהמחשב.",
      "editor.image.full_width_mobile": "רוחב מירבי בנייד",
      "editor.image.image_options": "אפשרויות תמונה",
      "editor.image.image_url": "קישור לתמונה",
      "editor.image.initial": "Initial",
      "editor.image.label": "תמונה",
      "editor.image.loaded_state": "Loaded: state",
      "editor.image.maintain_aspect_ratio": "שמור יחס",
      "editor.image.main_image": "תמונה ראשית",
      "editor.image.objects_merged": "אובייקטים מוזגו",
      "editor.image.offset_x": "Offset X",
      "editor.image.offset_y": "Offset Y",
      "editor.image.outline_width": "Outline Width",
      "editor.image.uploading": "מעלה",
      "editor.image.upload_error": "בעיה בהעלאת התמונה, וודא שהגודל וסוג הקובץ מותר להעלאה",
      "editor.image.use_percentages": "השתמש באחוזים",
      "editor.image_link.label": "קישור לתמונה",
      "editor.inherit_body_styles.label": "קבל סגנון ממבנה האב",
      "editor.labels.web": "רשתות חברתיות",
      "editor.labels_color.label": "צבע לייבלים",
      "editor.labels_font.label": "פונט לייבלים",
      "editor.labels_font_size.label": "גודל פונט לייבלים",
      "editor.layout.label": "מבנה",
      "editor.left.label": "שמאל",
      "editor.line.label": "Line",
      "editor.line_height.label": "Line Height",
      "editor.link.body": "גוף",
      "editor.link.call_phone": "מספר נייד",
      "editor.link.mailto": "אימייל ל",
      "editor.link.new_tab": "חלונית חדשה",
      "editor.link.no_page_sections_found": "No page sections found",
      "editor.link.onclick_unsupported": "בעת הקלקה לא נתמך",
      "editor.link.open_website": "פתח אתר",
      "editor.link.page_section": "עבור לדף",
      "editor.link.phone": "טלפון",
      "editor.link.same_tab": "באותו חלון",
      "editor.link.send_email": "שלח מייל",
      "editor.link.send_sms": "שלח SMS",
      "editor.link.subject": "נושא",
      "editor.link.target": "Target",
      "editor.link.url": "כתובת אתר",
      "editor.link_color.label": "צבע הקישור",
      "editor.margin.label": "Margin",
      "editor.mobile.description": "אתה עורך לסביבת מובייל, עבור לעריכת דסקטופ לכל האפשרויות.",
      "editor.offline_mode_is_enabled": "מצב אופליין מאופשר",
      "editor.padding.label": "ריווח/פדינג",
      "editor.placeholder.text": "אין תוכן, גרור מבנה מימין.",
      "editor.placeholder.text.left": "אין תוכן, גרור מבנה משמאל.",
      "editor.play_icon_color.label": "צבע אייקון הפעלה",
      "editor.play_icon_size.label": "גודל אייקון הפעלה",
      "editor.play_icon_type.label": "סוג אייקון הפעלה",
      "editor.preheader_text.description": "טקסט מקדים המוצג לפני פתיחת המייל",
      "editor.preheader_text.label": "טקסט מקדים המוצג לפני פתיחת המייל",
      "editor.right.label": "ימין",
      "editor.rounded_border.label": "גבול מעוגל",
      "editor.section_name.description": "שם מקטע נועד ליצור קישור לחלק בעמוד עצמו. הוא משמש כעוגן לכפתור וקישורים בדף.",
      "editor.section_name.label": "שם מקטע נועד ליצור קישור לחלק בעמוד עצמו. הוא משמש כעוגן לכפתור וקישורים בדף",
      "editor.separator.label": "מפריד",
      "editor.social_links.label": "קישורים חברתיים",
      "editor.space_between_fields.label": "ריווח שדות",
      "editor.submit_action.label": "Submit Action",
      "editor.text.label": "טקסט",
      "editor.text_align.label": "יישור טקסט",
      "editor.text_color.label": "צבע טקסט",
      "editor.top.label": "למעלה",
      "editor.top_left.label": "שמאל עליון",
      "editor.top_right.label": "ימין עליון",
      "editor.underline.label": "קו תחתון",
      "editor.video.arrow_only": "Arrow Only",
      "editor.video.video_camera": "מצלמת וידאו",
      "editor.video_url.description": "הוסף קישור מ יוטיוב או וימאו ליצרו תמונה מקדימה. התמונה תפנה לקישור שתוסיף.",
      "editor.video_url.label": "קישור לוידאו",
      "editor.width.label": "רוחב",
      "editors_panel.title.content": "תוכן",
      "editors_panel.title.contents": "תכנים",
      "editors_panel.title.rows": "שורה",
      "fields.birthday": "תאריך לידה",
      "fields.company": "חברה",
      "fields.name": "שם",
      "fields.phone_number": "מספר נייד",
      "fields.website": "אתר",
      "fields.zip_code": "מיקוד",
      "inbox_preview.design_updated": "העיצוב עודכן מאז התצוגה המקדימה האחרונה שלך",
      "labels.align_text": "יישור טקסט",
      "labels.blur": "טשטוש",
      "labels.category": "קטגוריה",
      "labels.color_picker": "בחירת צבע",
      "labels.comments": "הערות",
      "labels.desktop_preview": "תצוגה מקדימה בדסקטופ",
      "labels.device_override": "This device is overriding values",
      "labels.display_conditions": "תנאי תצוגה",
      "labels.editor": "עורך",
      "labels.font": "פונט",
      "labels.format_text": "פורמט טקסט",
      "labels.google_fonts": "פונטים של גוגל",
      "labels.gradient": "גרדיאנט",
      "labels.hide": "הסתר",
      "labels.horizontal": "אופקי",
      "labels.language": "שפה",
      "labels.loading": "טוען",
      "labels.loading_images": "טוען תמונות",
      "labels.load_more": "טען עוד",
      "labels.menu.links": "תפריט קישורים",
      "labels.merge_tags": "תוכן אישי",
      "labels.mobile_preview": "תצוגת נייד",
      "labels.new": "חדש",
      "labels.no_images": "אין תמונות",
      "labels.no_results": "אין תוצאה",
      "labels.objects": "נושאים",
      "labels.outline": "Outline",
      "labels.page": "עמוד",
      "labels.radius": "רדיוס",
      "labels.redo": "בצע מחדש",
      "labels.safe_search": "חיפוש בטוח",
      "labels.search": "חיפוש",
      "labels.search_images": "Search millions of images",
      "labels.section": "מקטע",
      "labels.shadow": "צל",
      "labels.size": "גודל",
      "labels.something_went_wrong": "משהו השתבש",
      "labels.special_links": "הוסף קישור",
      "labels.stock_photos_by": "Powered by Unsplash, Pexels, Pixabay.",
      "labels.stock_photos_license": "All images licensed under Creative Commons Zero.",
      "labels.stop": "עצור",
      "labels.tags": "תגיות",
      "labels.texture": "טקסטורה",
      "labels.text_style": "סגנון טקסט",
      "labels.timezone": "אזור זמן",
      "labels.undo": "בטל",
      "labels.vertical": "אנכי",
      "modals.category.invalid": "שם קטגוריה לא תקין",
      "modals.category.placeholder": "שם הקטגוריה",
      "modals.delete.columns": "המשך הפעולה יבטל שורות וטורים, אתה בטוח?",
      "modals.delete.confirmation": "אתה בטוח שאתה רוצה למחוק? הפעולה לא ניתן לשחזור.",
      "modals.delete.title": "מחק",
      "modals.display_conditions.title": "בחר תנאי תצוגה",
      "modals.preview.inbox_preview.button.generate_previews": "צור תצוגה מקדימה",
      "modals.preview.inbox_preview.label": "תצוגה מקדימה ב INBOX",
      "modals.preview.inbox_preview.label.generating_again": "צור מחדש",
      "modals.preview.inbox_preview.label.generating_previews": "יוצר תצוגות מקדימות",
      "modals.preview.inbox_preview.text.generate_previews": "בדוק איך הדיוור יראה בתיבות דוא\"ל שונות",
      "modals.preview.title": "תצוגה מקדימה",
      "modals.save_block.title": "שמור תבנית",
      "modals.tags.description": "תגיות נועדו לחיפוש, ניתן להוסיף מספר תגיות על ידי הפרה עם פסיק.",
      "modals.tags.placeholder": "תג1, תג2",
      "option_groups.action.title": "פעולה",
      "option_groups.all.title": "הכל",
      "option_groups.blank.title": "חדש",
      "option_groups.button.title": "כפתור",
      "option_groups.button_options.title": "אפשרויות כפתור",
      "option_groups.colors.title": "צבעים",
      "option_groups.columns.title": "עמודות",
      "option_groups.column_number.title": "עמודה {number}",
      "option_groups.column_properties.title": "מאפייני עמודה",
      "option_groups.countdown.title": "ספירה לאחור",
      "option_groups.default.title": "כללי",
      "option_groups.display_condition.title": "תנאי תצוגה",
      "option_groups.email_settings.title": "הגדרות מייל",
      "option_groups.fields.title": "שדות",
      "option_groups.form.title": "טופס",
      "option_groups.html.title": "HTML",
      "option_groups.icons.title": "אייקונים",
      "option_groups.image.title": "תמונה",
      "option_groups.labels.title": "Labels",
      "option_groups.last_saved.title": "נשמר לאחרונה",
      "option_groups.layout.title": "Layout",
      "option_groups.line.title": "Line",
      "option_groups.link.title": "קישור",
      "option_groups.links.title": "קישורים",
      "option_groups.menu_items.title": "פריטי תפריט",
      "option_groups.mobile.title": "נייד",
      "option_groups.responsive_design.title": "עיצוב רספונסיבי",
      "option_groups.row_properties.title": "מאפייני שורה",
      "option_groups.size.title": "גודל",
      "option_groups.spacing.title": "מרווח",
      "option_groups.styles.title": "סגנונות",
      "option_groups.text.title": "טקסט",
      "shapes.circle": "עיגול",
      "shapes.rectangle": "מלבן",
      "shapes.round": "עגול",
      "shapes.square": "ריבוע",
      "sizes.large": "גדול",
      "sizes.largest": "גדול מאוד",
      "sizes.medium": "בינוני",
      "sizes.small": "קטן",
      "sizes.smallest": "קטן מאוד",
      "tabs.audit.empty.description": "כאן תוכלו לראות את כל הבעיות שיש כרגע בעיצוב והתוכן.",
      "tabs.audit.empty.subtitle": "הכל תקין!",
      "tabs.audit.empty.title": "אין רכגע בעיות",
      "tabs.audit.missing_image_src": "חסר URL לתמונה",
      "tabs.audit.missing_title": "חסרה כותרת",
      "tabs.audit.missing_tool_name": "לא מצאנו את שם הכלי",
      "tabs.audit.rules.button.empty_links.description": "ללא קישור, כפתורים לא יעבדו...כדאי להוסיף קישורים",
      "tabs.audit.rules.button.empty_links.title": "קישורי הכפתורים ריקים",
      "tabs.audit.rules.image.alt_text.description": "ללא טקסט אלטרנטיבי,  נמענים המשתמשים בקוראי טקסט לא ידעו מה יש בתמונה.",
      "tabs.audit.rules.image.alt_text.title": "חסר טקסט אלטרנטיבי",
      "tabs.audit.rules.image.url.description": "לאל קישור לתמונה, התמונות הבאות לא יוצגו. העלו את התמונות הבאות.",
      "tabs.audit.rules.image.url.title": "חסרות תמונות",
      "tabs.audit.rules.menu.empty_links.description": "ללא קישור, הפריטים בתפריט לא יעבדו. הוסיפו קישורים לפריטים הבאים.",
      "tabs.audit.rules.menu.empty_links.title": "קישורי תפריט ריקים",
      "tabs.audit.take_me_to_fix": "קחו אותי לשם",
      "tools.form.field_label": "שם תווית",
      "tools.form.field_name": "שם השדה",
      "tools.form.field_type": "סוג שדה",
      "tools.form.field_value": "ערך שדה",
      "tools.form.new_field": "שדה חדש",
      "tools.form.options_one_per_line": "אפשרויות (אחת בכל שורה)",
      "tools.form.placeholder_text": "Placeholder Text",
      "tools.form.required_field": "שדה חובה",
      "tools.form.show_label": "הראה תווית",
      "tools.form.update_field": "עדכן שדה",
      "tools.social.click_icons_to_add": "לחץ על האייקון כדי להוסיף",
      "tools.tabs.audit": "Audit",
      "tools.tabs.blocks": "תבניות",
      "tools.tabs.body": "Body",
      "tools.tabs.content": "תוכן",
      "tools.tabs.images": "תמונות",
      "tools.tabs.row": "שורה",
      "tools.tabs.uploads": "העלאות",
      "tools.text.personalize": "שדה אישי",
      "tools.tooltip.drag_on_canvas": "גרור אל הקנאנבס",
      "tools.tooltip.got_it": "הבנתי"
    },
    'en-US': {
      "labels.merge_tags": "Personalization",
      "labels.special_links": "Add Link"
    }
  }
}
export const tabs = {
  images: {
    enabled: true
  }
}
export const features = {
  imageEditor: true,
  stockImages: {
    enabled: false
  },
  userUploads: true,
  pageAnchors: true,
  undoRedo: true,
  textEditor: {
    tables: true,
    emojis: true
  }
}
export const fonts = {
  fonts: {
    showDefaultFonts: false,
    customFonts: [
      {
        label: "Arial",
        value: "arial,helvetica,sans-serif"
      },
      {
        label: "Arial Black",
        value: "arial black,avant garde,arial"
      },
      {
        label: "Andale Mono",
        value: "andale mono,times"
      },
      // {
      //   label: "Assistant",
      //   value: "TODO"
      // },
      {
        label: "Book Antiqua",
        value: "book antiqua,palatino"
      },
      {
        label: "Comic Sans MS",
        value: "comic sans ms,sans-serif"
      },
      {
        label: "Courier New",
        value: "courier new,courier"
      },
      {
        label: "Georgia",
        value: "georgia,palatino"
      },
      {
        label: "Helvetica",
        value: "helvetica,sans-serif"
      },
      {
        label: "Impact",
        value: "impact,chicago"
      },
      // {
      //   label: "Monospace",
      //   value: "TODO"
      // },
      // {
      //   label: "New Roman",
      //   value: "TODO"
      // },
      // {
      //   label: "Serif",
      //   value: "TODO"
      // },
      {
        label: "Trebuchet MS",
        value: "trebuchet ms,geneva"
      },
      {
        label: "Verdana",
        value: "verdana,geneva"
      },
      {
        label: "Symbol",
        value: "symbol"
      },
      {
        label: "Tahoma",
        value: "tahoma,arial,helvetica,sans-serif"
      },
      {
        label: "Terminal",
        value: "terminal,monaco"
      },
      {
        label: "Times New Roman",
        value: "times new roman,times"
      },
      {
        label: "Lobster Two",
        value: "'Lobster Two',cursive",
        url: "https://fonts.googleapis.com/css?family=Lobster+Two:400,700"
      },
      {
        label: "Playfair Display",
        value: "'Playfair Display',serif",
        url: "https://fonts.googleapis.com/css?family=Playfair+Display:400,700"
      },
      {
        label: "Rubik",
        value: "'Rubik',sans-serif",
        url: "https://fonts.googleapis.com/css?family=Rubik:400,700"
      },
      {
        label: "Source Sans Pro",
        value: "'Source Sans Pro',sans-serif",
        url: "https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700"
      },
      {
        label: "Open Sans",
        value: "'Open Sans',sans-serif",
        url: "https://fonts.googleapis.com/css?family=Open+Sans:400,700"
      },
      {
        label: "Crimson Text",
        value: "'Crimson Text',serif",
        url: "https://fonts.googleapis.com/css?family=Crimson+Text:400,700"
      },
      {
        label: "Montserrat",
        value: "'Montserrat',sans-serif",
        url: "https://fonts.googleapis.com/css?family=Montserrat:400,700"
      },
      {
        label: "Old Standard TT",
        value: "'Old Standard TT',serif",
        url: "https://fonts.googleapis.com/css?family=Old+Standard+TT:400,700"
      },
      {
        label: "Lato",
        value: "'Lato',sans-serif",
        url: "https://fonts.googleapis.com/css?family=Lato:400,700"
      },
      {
        label: "Raleway",
        value: "'Raleway',sans-serif",
        url: "https://fonts.googleapis.com/css?family=Raleway:400,700"
      },
      {
        label: "Cabin",
        value: "'Cabin',sans-serif",
        url: "https://fonts.googleapis.com/css?family=Cabin:400,700"
      },
      {
        label: "Pacifico",
        value: "'Pacifico',cursive",
        url: "https://fonts.googleapis.com/css?family=Pacifico"
      }
    ]
  }
}
