
export const initFiles = (unlayer, files) => {
  // TODO: Get initFiles
  // TODO: Create files object array
  // initialize Gallery
  unlayer.editor.registerProvider('userUploads', function (params, done) {
    console.log(files);
    var images = [
      {
        id: Date.now() + 1,
        location: 'https://picsum.photos/id/1/500',
        width: 500,
        height: 500,
        contentType: 'image/png',
        source: 'user'
      },
      {
        id: Date.now() + 2,
        location: 'https://picsum.photos/id/2/500',
        width: 500,
        height: 500,
        contentType: 'image/png',
        source: 'user'
      }
    ];

    done(images);
  });
  // Image selection
  unlayer.registerCallback('selectImage', function (data, done) {
    console.log(data);
    console.log(done);
  });
}
