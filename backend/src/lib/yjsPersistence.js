
import * as Y from 'yjs';
import YjsDocument from '../models/YjsDocument.js';
import BookingNote from '../models/BookingNote.js';

const extractContentFromYDoc = (ydoc) => {
  try {
    const xmlFragment = ydoc.getXmlFragment('prosemirror');
    const contentStr = xmlFragment.toString();
    if (!contentStr || contentStr.trim() === '') {
      return ydoc.getXmlFragment('default').toString() || '';
    }
    return contentStr;
  } catch (err) {
    console.error('[Yjs Content Extract Error]:', err);
    return '';
  }
};

export const mongoPersistence = {
  bindState: async (docName, ydoc) => {
    if (!docName || docName === 'null' || docName === 'undefined') return;

    try {
      const persistedDoc = await YjsDocument.findOne({ docName });
      if (persistedDoc && persistedDoc.update) {
        Y.applyUpdate(ydoc, new Uint8Array(persistedDoc.update));
        console.log(`[Yjs DB] Loaded state for: ${docName}`);
      }
    } catch (error) {
      console.error(`[Yjs Persistence Error] Loading state for ${docName}:`, error);
    }
    ydoc.on('update', async (update) => {
      if (!docName || docName === 'null') return;

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
        if (docName.includes(':')) {
          const [subdomain, bookingId] = docName.split(':');
          const extractedContent = extractContentFromYDoc(ydoc);

          await BookingNote.findOneAndUpdate(
            { bookingId, subdomain },
            {
              bookingId,
              subdomain,
              content: extractedContent,
              lastUpdatedBy: 'system',
            },
            { upsert: true, new: true }
          );

          console.log(`[BookingNote Saved] ID: ${bookingId} | Subdomain: ${subdomain}`);
        }
      } catch (error) {
        console.error(`[Yjs Persistence Error] Saving update for ${docName}:`, error);
      }
    });
  },

  writeState: async (docName, ydoc) => {
    if (!docName || docName === 'null') return;

    try {
      const update = Y.encodeStateAsUpdate(ydoc);
      await YjsDocument.findOneAndUpdate(
        { docName },
        { update: Buffer.from(update) },
        { upsert: true }
      );

      if (docName.includes(':')) {
        const [subdomain, bookingId] = docName.split(':');
        const extractedContent = extractContentFromYDoc(ydoc);

        await BookingNote.findOneAndUpdate(
          { bookingId, subdomain },
          {
            bookingId,
            subdomain,
            content: extractedContent,
          },
          { upsert: true }
        );
        console.log(`[Final Write Success] Saved BookingNote for: ${docName}`);
      }
    } catch (error) {
      console.error(`[Yjs Persistence Error] Final write for ${docName}:`, error);
    }
  },
};