/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

//
// See README for overview
//

'use strict';

//
// Fetch the PDF document from the URL using promises
//
var promise = PDFJS.getDocument('//localhost/examples/helloworld/test.pdf').then(function(pdf) {
  // Using promise to fetch the page
  var currentPage = 1;
  var maxPages = pdf.pdfInfo.numPages;

  var wrapper = $('#pdf-wrapper');

  pdf.getPage(currentPage).then(addPage.bind(pdf, wrapper, currentPage, maxPages));

});


function addPage(wrapper, currentPage, maxPages, page) {
  var scale = 1;
  var viewport = page.getViewport(scale);
  console.log('rendering', currentPage);

  //
  // Prepare canvas using PDF page dimensions
  //
  var $canvas = $('<canvas class="pdf"></canvas>').appendTo(wrapper);
  $('<div class="page-info">' + currentPage + ' / ' + maxPages + '</div>').appendTo(wrapper);

  var context = $canvas[0].getContext('2d');

  $canvas[0].height = viewport.height;
  $canvas[0].width = viewport.width;

  //
  // Render PDF page into canvas context
  //
  var renderContext = {
    canvasContext: context,
    viewport: viewport
  };

  page.render(renderContext).then($.viewPort.check);

  $canvas.viewPort({
    'horizon:reach horizon:skip bottom:reach bottom:skip' : function(ev) {
      if($canvas.data('reached')) {
        return;
      }
      $canvas.data('reached', 1);
      if(currentPage < maxPages) {
        this.getPage(1+currentPage).then(addPage.bind(this, wrapper, 1+currentPage, maxPages));
      }
    }.bind(this)
  });
}
