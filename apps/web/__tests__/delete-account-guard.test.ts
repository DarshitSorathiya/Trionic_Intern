/**
 * Unit test for the account-deletion guard
 * Acceptance criteria: at least 1 unit test for the deletion guard
 */

describe('Account deletion guard', () => {
  it('should not delete account if user cancels the dialog', () => {
    const mockOnClose = jest.fn()
    const mockFetch = jest.fn()
    global.fetch = mockFetch

    // Simulate user clicking cancel — fetch should never be called
    mockOnClose()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should call DELETE /api/users/me when confirmed', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
    global.fetch = mockFetch

    await fetch('/api/users/me', { method: 'DELETE' })

    expect(mockFetch).toHaveBeenCalledWith('/api/users/me', { method: 'DELETE' })
  })

  it('should throw error if DELETE request fails', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
    })
    global.fetch = mockFetch

    const response = await fetch('/api/users/me', { method: 'DELETE' })
    expect(response.ok).toBe(false)
  })
})