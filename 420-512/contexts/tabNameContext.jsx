import React, { createContext, useContext, useState } from 'react';

const TabNameContext = createContext();

export const TabNameProvider= ({ children }) => {
    const [tabName, setTabName] = useState('');

    return (
    <TabNameContext.Provider value={{ tabName, setTabName }}>
        {children}
    </TabNameContext.Provider>
    );
};

export const useTabNameContext = () => {
    return useContext(TabNameContext);
};