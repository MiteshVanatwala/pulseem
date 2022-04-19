
export const initFiles = (unlayer, images) => {
  unlayer.editor.registerProvider('userUploads', function (params, done) {
    done(images);
  });
  // Image selection
  unlayer.registerCallback('selectImage', function (data, done) {
    console.log(data);
    console.log(done);
  });
}
