// Drug types configuration used across the application
export const DRUG_TYPES = [
    { code: 'M01AB', name: 'Anti-inflammatory and antirheumatic products (Acetic acid derivatives)' },
    { code: 'M01AE', name: 'Anti-inflammatory and antirheumatic products (Propionic acid derivatives)' },
    { code: 'N02BA', name: 'Other analgesics and antipyretics (Salicylic acid derivatives)' },
    { code: 'N02BE/B', name: 'Other analgesics and antipyretics (Pyrazolones and Anilides)' },
    { code: 'N05B', name: 'Psycholeptics drugs (Anxiolytic)' },
    { code: 'N05C', name: 'Psycholeptics drugs (Hypnotics and sedatives)' },
    { code: 'R03', name: 'Drugs for obstructive airway diseases' },
    { code: 'R06', name: 'Antihistamines for systemic use' }
];

// Helper function to get drug type by code
export const getDrugTypeByCode = (code) => {
    return DRUG_TYPES.find(drug => drug.code === code);
};

// Helper function to get drug type by name
export const getDrugTypeByName = (name) => {
    return DRUG_TYPES.find(drug => drug.name === name);
};

// Helper function to get drug type name from code
export const getDrugTypeName = (code) => {
    const drugType = getDrugTypeByCode(code);
    return drugType ? drugType.name : code;
};

// Helper function to get drug type code from name
export const getDrugTypeCode = (name) => {
    const drugType = getDrugTypeByName(name);
    return drugType ? drugType.code : name;
};

// Helper function to get formatted drug type label
export const getDrugTypeLabel = (code) => {
    const drug = getDrugTypeByCode(code);
    return drug ? `${drug.name} - ${drug.category} (${drug.code})` : '';
};

// Helper function to search drug types
export const searchDrugTypes = (searchTerm) => {
    const term = searchTerm.toLowerCase();
    return DRUG_TYPES.filter(drug => 
        drug.name.toLowerCase().includes(term) ||
        drug.code.toLowerCase().includes(term) ||
        drug.category.toLowerCase().includes(term)
    );
}; 