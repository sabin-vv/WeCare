const MEDICINE_API_BASE = 'https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search'

export interface MedicineSearchResult {
    name: string
    strength: string
    form: string
}

export interface MedicineApiResponse {
    results: Array<{
        id: number
        name: string
        strengths_and_forms: string[]
    }>
}

/**
 * Search for medicines by name
 * @param searchTerm - The medicine name to search for
 * @returns Array of medicine search results
 */
export const searchMedicines = async (searchTerm: string): Promise<MedicineSearchResult[]> => {
    if (!searchTerm.trim()) {
        return []
    }

    try {
        const params = new URLSearchParams({
            ef: 'STRENGTHS_AND_FORMS',
            terms: searchTerm,
            maxList: '500',
        })

        const response = await fetch(`${MEDICINE_API_BASE}?${params.toString()}`)

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`)
        }

        const data: MedicineApiResponse = await response.json()

        // Transform API response to our format
        const results: MedicineSearchResult[] = []

        if (data.results && Array.isArray(data.results)) {
            data.results.forEach((medicine) => {
                if (medicine.strengths_and_forms && Array.isArray(medicine.strengths_and_forms)) {
                    medicine.strengths_and_forms.forEach((strengthForm) => {
                        results.push({
                            name: medicine.name,
                            strength: strengthForm.split(' • ')[0] || strengthForm,
                            form: strengthForm.split(' • ')[1] || '',
                        })
                    })
                }
            })
        }

        return results
    } catch (error) {
        console.error('Error searching medicines:', error)
        return []
    }
}

/**
 * Get unique medicine names from search results
 * @param searchTerm - The medicine name to search for
 * @returns Array of unique medicine names
 */
export const getMedicineNames = async (searchTerm: string): Promise<string[]> => {
    const results = await searchMedicines(searchTerm)
    const uniqueNames = Array.from(new Set(results.map((r) => r.name)))
    return uniqueNames
}

/**
 * Get strengths and forms for a specific medicine
 * @param medicineName - The medicine name
 * @returns Array of strength and form combinations
 */
export const getMedicineStrengthsAndForms = async (medicineName: string): Promise<string[]> => {
    const results = await searchMedicines(medicineName)
    const uniqueStrengthForms = Array.from(
        new Set(
            results.map((r) => {
                if (r.form) {
                    return `${r.strength} • ${r.form}`
                }
                return r.strength
            }),
        ),
    )
    return uniqueStrengthForms
}
