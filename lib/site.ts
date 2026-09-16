/**
 * Every outbound link and every number the page quotes, in one place, so a
 * repo going public or a test count moving is a one-line change.
 */

/** Where this site is served. Used for canonical URLs, the sitemap and OG tags. */
export const SITE_URL = 'https://splitsheet.ethanhaque.ca'

/** The product itself. */
export const APP_URL = 'https://trip.ethanhaque.ca'

/** Opens the app on "Create account" instead of "Sign in" (see splitsheet-web's AuthScreen). */
export const SIGNUP_URL = `${APP_URL}/?signup`

export const AUTHOR = {
  name: 'Ethan Haque',
  portfolio: 'https://ethanhaque.ca',
  github: 'https://github.com/Ethan-Haque',
  linkedin: 'https://linkedin.com/in/ethan-haque',
}

export type Repo = {
  name: string
  url: string
}

export const REPOS = {
  web: {
    name: 'splitsheet-web',
    url: 'https://github.com/Ethan-Haque/splitsheet-web',
  },
  api: {
    name: 'splitsheet-api',
    url: 'https://github.com/Ethan-Haque/splitsheet-api',
  },
  site: {
    name: 'splitsheet-site',
    url: 'https://github.com/Ethan-Haque/splitsheet-site',
  },
} satisfies Record<string, Repo>

/**
 * Unit tests in splitsheet-web at the time of writing (`npm test` there).
 * Hand-maintained: this repo cannot see that one.
 */
export const APP_TEST_COUNT = 114
