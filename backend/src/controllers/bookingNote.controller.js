import BookingNote from '../models/BookingNote.js'; 

/**
 * REST Fallback: Save or Update Note Content
 */
export const saveNoteFallback = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { content, subdomain } = req.body;

    if (!bookingId || !subdomain) {
      return res.status(400).json({ error: 'Missing bookingId or subdomain' });
    }

    const note = await BookingNote.findOneAndUpdate(
      { bookingId, subdomain },
      { content, lastUpdatedBy: req.user?.id || 'anonymous' },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: 'Note saved successfully via REST fallback',
      note,
    });
  } catch (error) {
    console.error('[REST Fallback Error]:', error);
    return res.status(500).json({ error: 'Failed to save note via fallback' });
  }
};

/**
 * REST Fallback: Get Initial/Fallback Note Content
 */
export const getNoteFallback = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { subdomain } = req.query;

    const note = await BookingNote.findOne({ bookingId, subdomain });
    return res.status(200).json({ content: note ? note.content : '' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch fallback note' });
  }
};