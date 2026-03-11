import * as Turbo from '@hotwired/turbo'

export enum Route {
  Home = 'Home',
  About = 'About',
  Schedule = 'Schedule',
  Programs = 'Programs',
  Shop = 'Shop',
  Login = 'Login',
  Reviews = 'Reviews',
  Contact = 'Contact',
  BookTrial = 'BookTrial',
  TrialClassNextSteps = 'TrialClassNextSteps',
  InstructorAdam = 'InstructorAdam',
  InstructorDanniel = 'InstructorDanniel',
}

export const ROUTES: Record<Route, string> = {
  [Route.Home]: '/',
  [Route.About]: '/about/',
  [Route.Schedule]: '/schedule/',
  [Route.Programs]: '/programs/',
  [Route.Shop]: '/shop/',
  [Route.Login]: '/login/',
  [Route.Reviews]: '/reviews/',
  [Route.Contact]: '/contact/',
  [Route.BookTrial]: '/book-trial/',
  [Route.TrialClassNextSteps]: '/trial-class-next-steps/',
  [Route.InstructorAdam]: '/instructors/adam/',
  [Route.InstructorDanniel]: '/instructors/danniel/',
}

export type NavigateParams = Record<
  string,
  string | number | boolean | null | undefined
>

export type NavigateOptions = {
  params?: NavigateParams
  action?: 'advance' | 'replace'
}

export function Navigate(
  route: Route,
  options: NavigateOptions = {},
): void {
  const url = buildRouteUrl(route, options.params)

  if (options.action) {
    Turbo.visit(url, { action: options.action })
    return
  }

  Turbo.visit(url)
}

export function buildRouteUrl(
  route: Route,
  params?: NavigateParams,
): string {
  const url = new URL(ROUTES[route], window.location.origin)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value == null) continue
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}
