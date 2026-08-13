import * as Y from 'yjs';
import YjsDocument from '../models/YjsDocument.js';

export const mongoPersistence = {
  bindState: async (docName, ydoc) => {
    try {
      const persistedDoc = await YjsDocument.findOne({ docName });
      if (persistedDoc && persistedDoc.update) {
        Y.applyUpdate(ydoc, new Uint8Array(persistedDoc.update));
      }
    } catch (error) {
      console.error(`[Yjs Persistence Error] Loading state for ${docName}:`, error);
    }
    ydoc.on('update', async (update) => {
      try {
        const currentDoc = await YjsDocument.findOne({ docName });
        let mergedUpdate = update;

        if (currentDoc && currentDoc.update) {
          mergedUpdate = Y.mergeUpdates([
            new Uint8Array(currentDoc.update),
            update,
          ]);
        }

        await YjsDocument.findOneAndUpdate(
          { docName },
          { update: Buffer.from(mergedUpdate) },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error(`[Yjs Persistence Error] Saving update for ${docName}:`, error);
      }
    });
  },

  writeState: async (docName, ydoc) => {
    try {
      const update = Y.encodeStateAsUpdate(ydoc);
      await YjsDocument.findOneAndUpdate(
        { docName },
        { update: Buffer.from(update) },
        { upsert: true }
      );
    } catch (error) {
      console.error(`[Yjs Persistence Error] Final write for ${docName}:`, error);
    }
  },
};