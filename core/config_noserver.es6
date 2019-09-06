export default {
    // PATHS
    version: "3",
    xml_path: "ediphy/add_xml", // "http://lamas.dit.upm.es:3000/ediphy_documents/add_xml",
    xml_fake_path: "exercises/ua2_ue10_ejer7.xml",
    exercise_render_template_iframe_src: "./exercises/index.html",
    dist_index: "dist/index.html",
    dist_visor_bundle: "dist/visor-bundle.min.js",
    visor_bundle: "visor-bundle.min.js",
    image_placeholder: "images/placeholder.svg",
    broken_link: "images/broken_link.png",
    scorm_ejs: "./lib/scorm/scorm_nav.ejs",
    visor_ejs: "./lib/visor/index",
    scorm_zip_2004: "./lib/scorm/scorm2004.zip",
    scorm_zip_12: "./lib/scorm/scorm1.2.zip",
    visor_zip: "./lib/visor/dist.zip",
    export_url: false,
    import_url: false,
    search_vish_url: "https://vishub.org/apis/search/",
    upload_vish_url: false,
    defaultAspectRatio: 16 / 9,
    // OPTIONS
    externalProviders: {
        enable_search: true,
        enable_external_upload: false,
        enable_catalog_modal: false,
    },
    disable_save_button: true,
    publish_button: false,
    debug_scorm: false,
    show_numbers_before_navitems: false,
    api_editor_url_change: false,
    open_button_enabled: false,
    sections_have_content: false,
    autosave_time: 0, // Any value below 1000 will not autosave
    zip_files_forbidden: true,
    pluginList: [
        'EnrichedAudio',
        // 'BasicImage',
        'EnrichedPDF',
        'BasicText',
        // 'BasicPlayer',
        'DataTable',
        'EnrichedPlayer',
        'VirtualTour',
        'Webpage',
        'HotspotImages',
        // 'ContainerReact',
        'MultipleChoice',
        'MultipleAnswer',
        'FreeResponse',
        'InputText',
        // 'ContainerJS',
        'GraficaD3',
        'TrueFalse',
        'ScormPackage',
        // 'Visor3D',
        'FlashObject',
        // 'Rating',
        'AudioCue',

    ],
    availableLanguages: [
        'en',
        'es',
    ],
};
