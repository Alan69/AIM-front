import { Spin } from 'antd'
import React, { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

export const UnauthorisedLayout = () => {
  return (
    <div>
      <Suspense fallback={<Spin size="small" />}>
        <Outlet />
      </Suspense>
    </div>
  )
}
