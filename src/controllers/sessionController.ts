import { SessionModel } from '@/models/session.model'
import {
  CreateSessionDto,
  createSessionSchema,
  SessionQueryDto,
  sessionQuerySchema,
  UpdateSessionDto,
  updateSessionSchema,
} from '@/utils/dto/session.dto'
import { Request, Response } from 'express'

/**
 * Create a new session (add session when user logs in)
 */
export const addSession = async (
  req: Request<{}, {}, CreateSessionDto>,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id

    const { success, data, error } = await createSessionSchema.safeParseAsync({
      ...req.body,
      user_id: userId,
    })

    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }

    const session = await SessionModel.createSession(data)

    res.status(201).json({
      success: true,
      data: session,
    })
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: 'Session already exists for this device',
      })
      return
    }

    console.error('[addSession] Error:', err)
    res.status(500).json({
      success: false,
      error: 'An error occurred creating the session',
    })
  }
}

/**
 * Update an existing session
 */
export const updateSession = async (
  req: Request<{ sessionId: string }, {}, Omit<UpdateSessionDto, 'session_id'>>,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.params
    const userId = req.user!.id

    // Verify session belongs to current user
    const existingSession = await SessionModel.getSessionById(sessionId)
    if (!existingSession || existingSession.user_id !== userId) {
      res.status(404).json({
        success: false,
        error: 'Session not found or access denied',
      })
      return
    }

    const { success, data, error } = await updateSessionSchema.safeParseAsync({
      session_id: sessionId,
      ...req.body,
    })

    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }

    const updatedSession = await SessionModel.updateSession(data)

    res.json({
      success: true,
      data: updatedSession,
    })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Session not found',
      })
      return
    }

    console.error('[updateSession] Error:', err)
    res.status(500).json({
      success: false,
      error: 'An error occurred updating the session',
    })
  }
}

/**
 * Get all sessions for the current user
 */
export const getUserSessions = async (
  req: Request<{}, {}, {}, { device_id?: string; status?: string }>,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id
    const { device_id, status } = req.query

    const queryData: SessionQueryDto = {
      user_id: userId,
    }

    if (device_id) queryData.device_id = device_id
    if (status) queryData.status = status as any

    const { success, data, error } = await sessionQuerySchema.safeParseAsync(
      queryData
    )

    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }

    const sessions = await SessionModel.getUserSessions(data)

    res.json({
      success: true,
      data: sessions,
    })
  } catch (err: any) {
    console.error('[getUserSessions] Error:', err)
    res.status(500).json({
      success: false,
      error: 'An error occurred retrieving sessions',
    })
  }
}

/**
 * Get a specific session by ID
 */
export const getSession = async (
  req: Request<{ sessionId: string }>,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.params
    const userId = req.user!.id

    const session = await SessionModel.getSessionById(sessionId)

    if (!session || session.user_id !== userId) {
      res.status(404).json({
        success: false,
        error: 'Session not found or access denied',
      })
      return
    }

    res.json({
      success: true,
      data: session,
    })
  } catch (err: any) {
    console.error('[getSession] Error:', err)
    res.status(500).json({
      success: false,
      error: 'An error occurred retrieving the session',
    })
  }
}

/**
 * Revoke a specific session
 */
export const revokeSession = async (
  req: Request<{ sessionId: string }>,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.params
    const userId = req.user!.id

    // Verify session belongs to current user
    const existingSession = await SessionModel.getSessionById(sessionId)
    if (!existingSession || existingSession.user_id !== userId) {
      res.status(404).json({
        success: false,
        error: 'Session not found or access denied',
      })
      return
    }

    await SessionModel.revokeSession(sessionId)

    res.json({
      success: true,
      message: 'Session revoked successfully',
    })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Session not found',
      })
      return
    }

    console.error('[revokeSession] Error:', err)
    res.status(500).json({
      success: false,
      error: 'An error occurred revoking the session',
    })
  }
}

/**
 * Revoke all sessions except the current one
 */
export const revokeAllSessions = async (
  req: Request<{}, {}, { currentSessionId?: string }>,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id
    const { currentSessionId } = req.body

    if (!currentSessionId) {
      res.status(400).json({
        success: false,
        error: 'Current session ID is required',
      })
      return
    }

    // Verify current session belongs to user
    const currentSession = await SessionModel.getSessionById(currentSessionId)
    if (!currentSession || currentSession.user_id !== userId) {
      res.status(400).json({
        success: false,
        error: 'Invalid current session ID',
      })
      return
    }

    const result = await SessionModel.signOutAllOtherSessions(
      userId,
      currentSessionId
    )

    res.json({
      success: true,
      data: result,
    })
  } catch (err: any) {
    console.error('[revokeAllSessions] Error:', err)
    res.status(500).json({
      success: false,
      error: 'An error occurred revoking sessions',
    })
  }
}

/**
 * Sign out a specific session (set status to SIGNED_OUT)
 */
export const signOutSession = async (
  req: Request<{ sessionId: string }>,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.params
    const userId = req.user!.id

    // Verify session belongs to current user
    const existingSession = await SessionModel.getSessionById(sessionId)
    if (!existingSession || existingSession.user_id !== userId) {
      res.status(404).json({
        success: false,
        error: 'Session not found or access denied',
      })
      return
    }

    await SessionModel.signOutSession(sessionId)

    res.json({
      success: true,
      message: 'Session signed out successfully',
    })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Session not found',
      })
      return
    }

    console.error('[signOutSession] Error:', err)
    res.status(500).json({
      success: false,
      error: 'An error occurred signing out the session',
    })
  }
}

/**
 * Update last seen timestamp for a session
 */
export const updateLastSeen = async (
  req: Request<{ sessionId: string }>,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.params
    const userId = req.user!.id

    // Verify session belongs to current user
    const existingSession = await SessionModel.getSessionById(sessionId)
    if (!existingSession || existingSession.user_id !== userId) {
      res.status(404).json({
        success: false,
        error: 'Session not found or access denied',
      })
      return
    }

    await SessionModel.updateLastSeen(sessionId)

    res.json({
      success: true,
      message: 'Last seen updated successfully',
    })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Session not found',
      })
      return
    }

    console.error('[updateLastSeen] Error:', err)
    res.status(500).json({
      success: false,
      error: 'An error occurred updating last seen',
    })
  }
}

/**
 * Delete a session completely
 */
export const deleteSession = async (
  req: Request<{ sessionId: string }>,
  res: Response
): Promise<void> => {
  try {
    const { sessionId } = req.params
    const userId = req.user!.id

    // Verify session belongs to current user
    const existingSession = await SessionModel.getSessionById(sessionId)
    if (!existingSession || existingSession.user_id !== userId) {
      res.status(404).json({
        success: false,
        error: 'Session not found or access denied',
      })
      return
    }

    await SessionModel.deleteSession(sessionId)

    res.status(204).json({
      success: true,
      message: 'Session deleted successfully',
    })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Session not found',
      })
      return
    }

    console.error('[deleteSession] Error:', err)
    res.status(500).json({
      success: false,
      error: 'An error occurred deleting the session',
    })
  }
}

/**
 * Get active sessions count for the current user
 */
export const getActiveSessionsCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id

    const count = await SessionModel.getActiveSessionsCount(userId)

    res.json({
      success: true,
      data: { count },
    })
  } catch (err: any) {
    console.error('[getActiveSessionsCount] Error:', err)
    res.status(500).json({
      success: false,
      error: 'An error occurred retrieving active sessions count',
    })
  }
}
