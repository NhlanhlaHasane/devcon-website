import React from 'react'
import { navigate, RouteComponentProps, RouterProps } from '@reach/router'
import { useAccountContext } from 'src/context/account-context'

interface PrivateRouteProps extends RouteComponentProps<RouterProps> {
  component: any
}

export const PrivateRoute = ({ component: Component, location, ...rest }: PrivateRouteProps) => {
  const accountContext = useAccountContext()

  if (!accountContext.account && location?.pathname !== `/app/login`) {
    navigate('/app/login')
    return null
  }

  return <Component {...rest} />
}