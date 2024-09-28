import { useMediaQuery } from 'react-responsive'

export const useIsMobile = () => useMediaQuery({ maxWidth: 576 })

export const useIsTablet = () => useMediaQuery({ maxWidth: 768 })

export const useIsXlTablet = () => useMediaQuery({ maxWidth: 962 })

export const useIsLaptop = () => useMediaQuery({ maxWidth: 1100 })

export const useIsLargeLaptop = () => useMediaQuery({ maxWidth: 1263 })