import config from '../../tailwind.config';

const screens = config.theme.screens;

export const breakpointSelectors = ['sm', 'md', 'lg', 'xl'];
export const getBreakpointsFromConfig = () => {
    return breakpointSelectors.map(
        (bp) => parseInt(screens[bp].slice(0, -2))
    );
}

// storing these as strings makes sure Tailwind doesn't optimize away needed classes
//      (note the leading spaces so we can concat them)
export const Z_INDICIES = [
    ' z-50', 
    ' z-30', 
    ' z-10', 
];
