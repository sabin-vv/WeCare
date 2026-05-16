import Header from '@/shared/components/Header/Header'
import { patientNavLinks } from '@/shared/constants/navLinks'

const PatientHeader = () => {
    return <Header navLinks={patientNavLinks} />
}
export default PatientHeader
