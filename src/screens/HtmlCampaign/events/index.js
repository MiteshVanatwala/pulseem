import { initFiles } from './gallery';
import { initBlocks } from './blocks';

export const initEvents = ({ unlayer, userBlocks }) => {
  try {
    return new Promise((resolve, reject) => {
      try {
        initBlocks(unlayer, userBlocks);
        initFiles(unlayer);
        resolve(true);
      }
      catch (e) {
        reject(false);
      }
    });
  } catch (e) {
    console.error('index', e);
  }
}
