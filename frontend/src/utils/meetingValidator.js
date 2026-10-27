/**
 * meetingValidator.js (Frontend)
 * Validates that a video meeting URL uses secure HTTPS and is from an approved provider.
 */

export const APPROVED_PROVIDERS = [
  { name: 'Google Meet', match: (h) => h === 'meet.google.com' },
  { name: 'Zoom', match: (h) => h === 'zoom.us' || h.endsWith('.zoom.us') },
  { name: 'Microsoft Teams', match: (h) => h === 'teams.microsoft.com' || h === 'teams.live.com' },
  { name: 'Cisco Webex', match: (h) => h === 'webex.com' || h.endsWith('.webex.com') },
  { name: 'Jitsi Meet', match: (h) => h === 'meet.jit.si' || h.endsWith('.jitsi.net') },
  { name: 'Whereby', match: (h) => h === 'whereby.com' || h.endsWith('.whereby.com') }
];

export function validateMeetingUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return { valid: false, message: 'Meeting URL is required' };
  }

  const trimmed = urlString.trim();
  if (!trimmed) {
    return { valid: false, message: 'Meeting URL cannot be empty' };
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      message: 'Please enter a valid URL starting with https:// (e.g. https://meet.google.com/abc-defg-hij)'
    };
  }

  // 1. Must use HTTPS
  if (parsed.protocol !== 'https:') {
    return {
      valid: false,
      message: 'Meeting link must use secure HTTPS protocol (e.g. https://...)'
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Must match approved providers
  const matchedProvider = APPROVED_PROVIDERS.find(p => p.match(hostname));
  if (!matchedProvider) {
    return {
      valid: false,
      message: 'Meeting link must be from an approved provider: Google Meet (meet.google.com), Zoom (*.zoom.us), Microsoft Teams, Webex, Jitsi, or Whereby'
    };
  }

  // 3. Provider-specific checks
  if (matchedProvider.name === 'Google Meet') {
    const code = parsed.pathname.replace(/^\/+/, '').split('/')[0].split('?')[0];
    if (!code) {
      return {
        valid: false,
        message: 'Google Meet URL must include a meeting code (e.g. https://meet.google.com/abc-defg-hij)'
      };
    }

    // Google Meet codes are 10 lowercase letters in xxx-xxxx-xxx format, or workspace lookup paths
    const meetCodeRegex = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i;
    const isLookup = parsed.pathname.includes('/lookup/');
    if (!meetCodeRegex.test(code) && !isLookup) {
      return {
        valid: false,
        message: 'Invalid Google Meet code format. Google Meet codes must follow the format xxx-xxxx-xxx (e.g. https://meet.google.com/abc-defg-hij). Custom names cause "Invalid video call name" errors in Google Meet.'
      };
    }
  }

  return {
    valid: true,
    url: trimmed,
    provider: matchedProvider.name
  };
}
