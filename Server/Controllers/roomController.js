const { supabaseAdmin } = require('../Config/supabase');

const DEFAULT_PROJECT_ID = '00000000-0000-0000-0000-000000000002';

const createRoomDocument = async (req, res) => {
  const { roomId, projectId } = req.body;

  if (!roomId) {
    return res.status(400).json({
      success: false,
      message: 'Room ID is required'
    });
  }

  const targetProjectId = projectId || DEFAULT_PROJECT_ID;
  const uniqueFileName = `room-${roomId}.js`;

  try {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert({
        id: roomId,
        project_id: targetProjectId,
        name: uniqueFileName,
        path: uniqueFileName,
        code_content: '// Start typing your code here...'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating room document:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    return res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Server error creating room:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { createRoomDocument };
