import { useMediaQuery } from 'react-responsive'

export const useIsMobile = () => useMediaQuery({ maxWidth: 576 })

export const useIsTablet = () => useMediaQuery({ maxWidth: 768 })

export const useIsXlTablet = () => useMediaQuery({ maxWidth: 992 })

export const useIsSmallLaptop = () => useMediaQuery({ maxWidth: 1024 })

export const useIsMediumLaptop = () => useMediaQuery({ maxWidth: 1100 })

export const useIsLargeLaptop = () => useMediaQuery({ maxWidth: 1263 })