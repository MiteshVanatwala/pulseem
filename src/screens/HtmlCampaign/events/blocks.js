import {
  save,
  update,
  remove,
  store
} from '../../../redux/reducers/campaignEditorSlice';

export const initBlocks = (unlayer, userBlocks) => {
  // Blocks
  try {
    unlayer.registerCallback('block:added', async function (newBlock, done) {
      // Each block should have it's own unique id
      const res = await store.dispatch(save(newBlock));
      const newId = res.payload.Block.ID;
      newBlock.id = newId;

      done(newBlock);
    });
    unlayer.registerCallback('block:modified', async function (existingBlock, done) {
      console.log('block:modified', existingBlock);

      // Update the block in your database here
      // and pass the updated object to done callback.
      await update(existingBlock);

      done(existingBlock);
    });
    unlayer.registerCallback('block:removed', async function (existingBlock, done) {
      console.log('block:removed', existingBlock);

      // Delete the block from your database here.
      await remove(existingBlock.id);

      done(existingBlock);
    });
    unlayer.editor.registerProvider('blocks', async function (params, done) {
      done(userBlocks);
    });
    unlayer.editor.reloadProvider('blocks');
  }
  catch (e) {
    console.error(e);
  }

}
