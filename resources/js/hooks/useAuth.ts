import { usePage } from '@inertiajs/react'

interface User {
  id: number
  name: string
  email: string
  roles: Array<{
    name: string
    display_name: string
    permissions: Array<{
      name: string
      display_name: string
    }>
  }>
}

interface PageProps extends Record<string, unknown> {
  auth: {
    user: User
  }
}

export function useAuth() {
  const { auth } = usePage<PageProps>().props
  return auth
}

export function useUser() {
  const { user } = useAuth()
  return user
}

export function usePermissions() {
  const user = useUser()
  
  const permissions = user?.roles?.flatMap(role => 
    role.permissions?.map(permission => permission.name) || []
  ) || []

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission)
  }

  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some(permission => permissions.includes(permission))
  }

  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every(permission => permissions.includes(permission))
  }

  const hasRole = (role: string): boolean => {
    return user?.roles?.some(r => r.name === role) || false
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role))
  }

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
  }
}