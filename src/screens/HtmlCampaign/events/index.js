// import { initFiles } from './gallery';
import { initBlocks } from './blocks';

export const initEvents = (params) => {
  try {
    const { unlayer, userBlocks, images } = params;
    return new Promise((resolve, reject) => {
      try {
        initBlocks(unlayer, userBlocks);
        //initFiles(unlayer, images);
        resolve(true);
      }
      catch (e) {
        console.error(e);
        reject(false);
      }
    });
  } catch (e) {
    console.error('index', e);
  }
}
