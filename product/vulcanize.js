/********************************************************************************
 *   create files for production
 *
 * with the vulcanize-tool, the files definded will be created
 * with all its dependencies inside as one file.
 ********************************************************************************/
/* to get the content */
var Vulcanize = require('vulcanize');
/* to write the content into a new file */
var writeFile = require('write');

/* define here the files to vulcanize */
var files = [
  'index.html',
  'brautpaar.html',
  'trauung.html',
  'organisation.html',
  'geschenke.html',
  'geschenke-danke.html',
  'anmeldung.html',
  'anmeldung-danke.html'
];

/* process starts here */
if (files) { /* checks if there are files specified */
  /* loops the files-array */
  for (var i = 0; i < files.length; i++) {
    /* gets current file-name */
    var currentFile = files[i];
    var absDir = '/mnt/c/xampp/htdocs/projects/personal/raphi.nahli.ch/our-wedding/product';
    /* executes the big stuff */
    vulcFunction(currentFile, absDir);

    /**
     * gets a file in the defined directory
     * and put it and all its dependencies to a file in the dist/ folder
     * @param file (string) filename
     * @param dir (string) absolute directory
     */
    function vulcFunction(file, dir) {
      /* define vulcanize inputs */
      var vulcan = new Vulcanize({
        abspath: dir,
        excludes: [],
        stripExcludes: [],
        inlineScripts: false,
        inlineCss: false,
        addedImports: [],
        redirects: [],
        implicitStrip: true,
        stripComments: false,
        inputUrl: ''
      });

      /* vulcanize */
      vulcan.process(file, function (err, inlinedHtml) {
        /* write the file into the dist/ directory */
        writeFile('dist/' + file, inlinedHtml, function (err) {
          if (err) console.log(err);
          /* logs success message */
          console.log(file + ' has been vulcanized and put to dist/ directory :)');
        });
      });
    }
  }
} else { /* logs message if there is no file */
  console.log('No files defined!');
}
