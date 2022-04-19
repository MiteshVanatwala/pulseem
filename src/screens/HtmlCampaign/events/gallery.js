
export const initFiles = (unlayer, images) => {
  unlayer.editor.registerProvider('userUploads', function (params, done) {
    done(images);
  });
}
