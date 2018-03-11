import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import Spinner from '../../../components/Spinner';
import { getCaseStatus, getCaseDoctorADiagnosisLocationHash, diagnoseCase, diagnoseChallengedCase } from '../../../utils/web3-util';
import { uploadJson, downloadJson } from '../../../utils/storage-util';
import '../../../../node_modules/react-checkbox-tree/lib/react-checkbox-tree.css';
import CheckboxTree from 'react-checkbox-tree';

const nodes = [
    {
    value: 'Over the Counter Remedies or Courses of Action',
    label: 'Over the Counter Remedies or Courses of Action',
    children: [
        { value: 'Apply Vaseline twice daily to the affected areas.', label: 'Apply Vaseline twice daily to the affected areas.' },
        { value: 'Apply Neutrogena Norwegian Formula twice daily to the affected areas.', label: 'Apply Neutrogena Norwegian Formula twice daily to the affected areas.' },
        { value: 'Apply CeraVe twice daily to the affected areas.', label: 'Apply CeraVe twice daily to the affected areas.' },
        { value: 'Apply AmLactin twice daily to the affected areas.', label: 'Apply AmLactin twice daily to the affected areas.' },
        { value: 'Apply Aquaphor twice daily to the affected areas.', label: 'Apply Aquaphor twice daily to the affected areas.' },
        { value: 'Apply Hydrocortisone 1% cream twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.', label: 'Apply Hydrocortisone 1% cream twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.' },
        { value: 'Apply Hydrocortisone 1% ointment twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.', label: 'Apply Hydrocortisone 1% ointment twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.' },
        { value: 'Shampoo with a medicated shampoo such as selenium sulfide (selsun blue) or Head and Shoulders. Allow to sit on scalp or skin for 5 minutes prior to rinsing.', label: 'Shampoo with a medicated shampoo such as selenium sulfide (selsun blue) or Head and Shoulders. Allow to sit on scalp or skin for 5 minutes prior to rinsing.' },
        { value: 'Use over the counter wart treatment, MediPlast (40% salicylic acid plaster), every day over the wart and wash after 24 hours. Repeat daily. It may take weeks to months for successful treatment.', label: 'Use over the counter wart treatment, MediPlast (40% salicylic acid plaster), every day over the wart and wash after 24 hours. Repeat daily. It may take weeks to months for successful treatment.' },
        { value: 'Recommend lukewarm water while showering. Use moisturizing soaps such as Dove or Oil of Olay. Moisturize immediately after showering.', label: 'Recommend lukewarm water while showering. Use moisturizing soaps such as Dove or Oil of Olay. Moisturize immediately after showering.' },
        { value: 'Avoid scratching. Cut nails short to help prevent scratching.', label: 'Avoid scratching. Cut nails short to help prevent scratching.' },
        { value: 'These are common, benign lesions. They rarely become cancerous.', label: 'These are common, benign lesions. They rarely become cancerous.' },
        { value: 'No further treatments needed.', label: 'No further treatments needed.' },
    ]},

    {
    value: 'Topical Medications (From your primary care doctor or local dermatologist)',
    label: 'Topical Medications (From your primary care doctor or local dermatologist)',
    children: [
        { value: 'Apply Hydrocortisone 2.5% cream twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.', label: 'Apply Hydrocortisone 2.5% cream twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.' },
        { value: 'Apply Hydrocortisone 2.5% ointment twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.', label: 'Apply Hydrocortisone 2.5% ointment twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.' },
        { value: 'Apply Desonide 0.05% cream twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.', label: 'Apply Desonide 0.05% cream twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.' },
        { value: 'Apply Desonide 0.05% ointment twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.', label: 'Apply Desonide 0.05% ointment twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.' },
        { value: 'Apply Triamcinolone 0.025% cream twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.', label: 'Apply Triamcinolone 0.025% cream twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.' },
        { value: 'Apply Triamcinolone 0.025% ointment twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.', label: 'Apply Triamcinolone 0.025% ointment twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.' },
        { value: 'Apply Triamcinolone 0.1% cream twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.', label: 'Apply Triamcinolone 0.1% cream twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.' },
        { value: 'Apply Triamcinolone 0.1% ointment twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.', label: 'Apply Triamcinolone 0.1% ointment twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.' },
        { value: 'Apply Clobetasol 0.05% cream twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.', label: 'Apply Clobetasol 0.05% cream twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.' },
        { value: 'Apply Clobetasol 0.05% ointment twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.', label: 'Apply Clobetasol 0.05% ointment twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.' },
        { value: 'Apply Calcipotriene (Dovonex) 0.005% ointment twice daily Monday through Friday on weeks not using topical steroids.', label: 'Apply Calcipotriene (Dovonex) 0.005% ointment twice daily Monday through Friday on weeks not using topical steroids.' },
        { value: 'Apply Fluocinonide 0.05% topical solution twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.', label: 'Apply Fluocinonide 0.05% topical solution twice daily for 2 weeks, then twice daily on weekends for 2 weeks. Repeat as needed.' },
        { value: 'Apply Terbinafine 1% cream twice daily for 3 weeks.', label: 'Apply Terbinafine 1% cream twice daily for 3 weeks.' },
        { value: 'Apply Ketoconazole 2% cream twice daily.', label: 'Apply Ketoconazole 2% cream twice daily.' },
        { value: 'Apply Ketoconazole 2% shampoo 2 to 3 times per week.', label: 'Apply Ketoconazole 2% shampoo 2 to 3 times per week.' },
        { value: 'Apply Clindamycin 1% lotion twice daily.', label: 'Apply Clindamycin 1% lotion twice daily.' },
        { value: 'Apply Clindamycin 1% topical solution twice daily.', label: 'Apply Clindamycin 1% topical solution twice daily.' },  
        { value: 'Apply Metronidazole 1% topical gel twice daily.', label: 'Apply Metronidazole 1% topical gel twice daily.' },
        { value: 'Apply Sarna lotion twice daily at site of itching.', label: 'Apply Sarna lotion twice daily at site of itching.' },
        { value: 'Apply Permethrin 5% cream to your entire body (neck and below) for 8 hours overnight and wash in the morning. Repeat this treatment exactly 1 week later.', label: 'Apply Permethrin 5% cream to your entire body (neck and below) for 8 hours overnight and wash in the morning. Repeat this treatment exactly 1 week later.' },
        { value: 'Apply Mupirocin 2% ointment 3 times daily for 10 days.', label:'Apply Mupirocin 2% ointment 3 times daily for 10 days.' },
        { value: 'Apply 5-Fluorouracil (Efudex) 5% cream twice daily to affected areas for 3 weeks, followed by Triamcinolone 0.1% cream twice daily for 1 week.', label:'Apply 5-Fluorouracil (Efudex) 5% cream twice daily to affected areas for 3 weeks, followed by Triamcinolone 0.1% cream twice daily for 1 week.' },
        { value: 'Apply imiquimod (Aldara) 5% cream to affected areas every night.', label:'Apply imiquimod (Aldara) 5% cream to affected areas every night.' },
        { value: 'Apply 20% urea cream twice daily.', label:'Apply 20% urea cream twice daily.' },
        { value: 'Apply 40% urea cream twice daily.', label:'Apply 40% urea cream twice daily.' },
        { value: 'Apply Ciclopirox 8% (Penlac) topical solution to affected nails at bed time for 7 days and then remove with nail polish remover. Repeat.', label:'Apply Ciclopirox 8% (Penlac) topical solution to affected nails at bed time for 7 days and then remove with nail polish remover. Repeat.' },
    ]},

    {
    value: 'Oral Medications (From your primary care doctor or local dermatologist)',
    label: 'Oral Medications (From your primary care doctor or local dermatologist)',
    children: [
        { value: 'Take Cetirizine 10 mg twice daily for itching.', label: 'Take Cetirizine 10 mg twice daily for itching.' },
        { value: 'Take Hydroxyzine 25 mg every night for itching.', label: 'Take Hydroxyzine 25 mg every night for itching.' },
        { value: 'Take Cephalexin 500 mg three times daily for 10 days.', label: 'Take Cephalexin 500 mg three times daily for 10 days.' },
        { value: 'Take Doxycycine 100 mg twice daily for 10 days.', label: 'Take Doxycycine 100 mg twice daily for 10 days.' },
        { value: 'Take Doxycycline 100 mg twice daily for 3 months.', label: 'Take Doxycycline 100 mg twice daily for 3 months.' },
        { value: 'Take Minocycline 100 mg twice daily for 3 months.', label: 'Take Minocycline 100 mg twice daily for 3 months.' },
        { value: 'Take Cephalexin 500 mg twice daily for 3 months.', label: 'Take Cephalexin 500 mg twice daily for 3 months.' },
        { value: 'Take Terbinafine 250 mg once daily for 6 weeks. Your liver enzymes will need to be checked before and during treatment.', label: 'Take Terbinafine 250 mg once daily for 6 weeks. Your liver enzymes will need to be checked before and during treatment.' },
        { value: 'Take Terbinafine 250 mg once daily for 12 weeks. Your liver enzymes will need to be checked before and during treatment.', label: 'Take Terbinafine 250 mg once daily for 12 weeks. Your liver enzymes will need to be checked before and during treatment.' },
    ]},

    {
    value: 'Procedures (By your primary care doctor or local dermatologist)',
    label: 'Procedures (By your primary care doctor or local dermatologist)',
    children: [
        { value: 'Recommend a biopsy by shave to help diagnose your condition.', label: 'Recommend a biopsy by shave to help diagnose your condition.' },
        { value: 'Recommend a punch biopsy to help diagnose your condition.', label: 'Recommend a punch biopsy to help diagnose your condition.' },
        { value: 'Recommend an excisional biopsy with 2-4 mm margins to help diagnose your condition.', label: 'Recommend an excisional biopsy with 2-4 mm margins to help diagnose your condition.' },
        { value: 'Recommend cryotherapy with liquid nitrogen. Your physician should treat the area three times. If there is no resolution after 2 months, another round of cryotherapy may be helpful. If this does not help, then a biopsy may be necessary.', label: 'Recommend cryotherapy with liquid nitrogen. Your physician should treat the area three times. If there is no resolution after 2 months, another round of cryotherapy may be helpful. If this does not help, then a biopsy may be necessary.' },
        { value: 'This is a benign lesion, but cryotherapy with liquid nitrogen may be helpful.', label: 'This is a benign lesion, but cryotherapy with liquid nitrogen may be helpful.' },
    ]},

    {
    value: 'You may have a more complex condition that should be evaluated by your primary care physician or local dermatologist. We highly encourage you to seek a live consultation.',
    label: 'You may have a more complex condition that should be evaluated by your primary care physician or local dermatologist. We highly encourage you to seek a live consultation.',
    },

    {
    value: 'Other',
    label: 'Other',
    },
];


class SubmitDiagnosis extends Component {
    constructor(){
        super();

        this.state = {
            isChallenge: false,
            originalDiagnosis: null,

            checked:[],
            expanded:[],

            diagnosis: null,
            recommendation: [],
            otherRecommendation:null,
            otherDiagnosis:null,
            primaryFollowUp:null,
            dermatologistFollowUp:null,
            teledermatologyFollowUp:null,
            incompleteDetailsModalMessage:null,
            
            submitInProgress: false,
            showConfirmationModal: false,
            showThankYouModal: false,
            showEmptyDiagnosisFoundModal:false,

            showOtherTextBox:false,
            showFollowUpTextBox:false,
            showOtherDiagnosisTextBox:false,
        };

        this.onCheck = this.onCheck.bind(this);
        this.onExpand = this.onExpand.bind(this);
    }

    onCheck(checked){
        if (checked.indexOf("Other") >= 0){
            this.setState({showOtherTextBox:true});
        } else{
            this.setState({showOtherTextBox:false});
        }
        this.setState({ checked });
    }

    onExpand(expanded){
        this.setState({ expanded });
    }

    async componentDidMount() {
        const status = await getCaseStatus(this.props.caseAddress);

        if(status.code === 4) {
        
            const diagnosisHash = await getCaseDoctorADiagnosisLocationHash(this.props.caseAddress);

            const diagnosisJson = await downloadJson(diagnosisHash);
            const diagnosis = JSON.parse(diagnosisJson);
            
            this.setState({
                isChallenge: true,
                originalDiagnosis: diagnosis.diagnosis
            });
        }
    }

    updateRecommendation() {
        for(var i=0; i<this.state.checked.length; i++){
            if (this.state.recommendation.indexOf(this.state.checked[i]) === -1){
                if (this.state.checked[i] === "Other"){
                    if (this.state.recommendation.indexOf(this.state.otherRecommendation) === -1){
                        this.state.recommendation.push(this.state.otherRecommendation);
                    }
                }
                else{
                    this.state.recommendation.push(this.state.checked[i]);
                }
            }
        }
    }

    updateFinalDiagnosis(){
        if (this.state.diagnosis === "Other"){
            this.setState({diagnosis: this.state.otherDiagnosis});
        }
    }

    updateFinalFollowUp(){
        var head = null;
        var index = null;
        if (this.state.showFollowUpTextBox){
            index = this.state.recommendation.indexOf("No follow up required.");
            if (index !== -1){
                this.state.recommendation.splice(index,1);
            }

            if (this.state.primaryFollowUp != null){
                head = "Follow up with your primary care physician in ";
                head = head.concat(this.state.primaryFollowUp.toString());
                if (this.state.recommendation.indexOf(head) === -1){
                    this.state.recommendation.push(head);
                }
            }
            if (this.state.dermatologistFollowUp != null){
                head = "Consult a dermatologist in-person in ";
                head = head.concat(this.state.dermatologistFollowUp);
                if (this.state.recommendation.indexOf(head) === -1){
                    this.state.recommendation.push(head);
                }
            }
            if (this.state.teledermatologyFollowUp != null){
                head = "Reconsult teledermatology in ";
                head = head.concat(this.state.teledermatologyFollowUp);
                if (this.state.recommendation.indexOf(head) === -1){
                    this.state.recommendation.push(head);
                }
            }
        }
        else{
            if (this.state.recommendation.length > 0){
                head = "Follow up with your primary care physician in ";
                head = head.concat(this.state.primaryFollowUp);
                index = this.state.recommendation.indexOf(head);
                if (index > -1){
                    this.state.recommendation.splice(index,1);
                }
                
                head = "Consult a dermatologist in-person in ";
                head = head.concat(this.state.dermatologistFollowUp);
                index = this.state.recommendation.indexOf(head);
                if (index > -1){
                    this.state.recommendation.splice(index,1);
                }
                
                head = "Reconsult teledermatology in ";
                head = head.concat(this.state.teledermatology);
                index = this.state.recommendation.indexOf(head);
                if (index > -1){
                    this.state.recommendation.splice(index,1);
                }
                this.state.recommendation.push("No follow up required.");
            }
        }
    }

    checkFollowup = (event) => {
        if (this.state.showFollowUpTextBox){
            this.setState({showFollowUpTextBox:false});
        } 
        else{
            this.setState({showFollowUpTextBox:true});
        }
    }

    updateDiagnosis = (event) => {
        if(event.target.value === "Other"){
            this.setState({showOtherDiagnosisTextBox:true});
        }
        else{
            this.setState({showOtherDiagnosisTextBox:false});
        }
        this.setState({diagnosis: event.target.value});
    }

    updateFollowUp = (event) => {
        if (event.target.id === "primaryCare"){
            this.setState({primaryFollowUp: event.target.value});
        }
        else if (event.target.id === "dermatologist"){
            this.setState({dermatologistFollowUp: event.target.value});   
        }
        else {
            this.setState({teledermatologyFollowUp: event.target.value});   
        }
    }

    updateOtherRecommendation = (event) => {
        this.setState({otherRecommendation:event.target.value});
    }

    updateOtherDiagnosis = (event) => {
        this.setState({otherDiagnosis:event.target.value});
    }

    handleEmptyDiagnosisFoundModal = async (event) => {
        event.preventDefault();

        this.setState({incompleteDetailsModalMessage: null});
        this.setState({showEmptyDiagnosisFoundModal:false});        
    }

    handleSubmit = async (event) => {
        event.preventDefault();

        this.updateRecommendation();

        this.updateFinalDiagnosis();

        this.updateFinalFollowUp();

        if ((this.state.recommendation.length < 1) || (this.state.diagnosis == null)){
            this.setState({incompleteDetailsModalMessage: "Please fill in a diagnosis and at least 1 recommendation."});
            this.setState({showEmptyDiagnosisFoundModal: true});
        }
        else if ((this.state.showFollowUpTextBox) && (this.state.primaryFollowUp === null) && (this.state.dermatologistFollowUp === null) && (this.state.teledermatologyFollowUp === null)){
                this.setState({incompleteDetailsModalMessage: "Please complete follow up details."});
                this.setState({showEmptyDiagnosisFoundModal: true});
        }
        else{
            this.setState({showConfirmationModal: true});
        }
    }

    handleCloseThankYouModal = (event) => {
        event.preventDefault();
        
        this.setState({showThankYouModal: false});

        this.props.history.push('/physician-profile');
    }

    handleCancelConfirmSubmissionModal = (event) => {
        this.setState({showConfirmationModal: false});
    }

    handleAcceptConfirmSubmissionModal = async (event) => {
        this.setState({showConfirmationModal: false});
        await this.submitDiagnosis();
    }

    submitDiagnosis = async () => {
        this.setState({submitInProgress: true});

        const diagnosisInformation = {
            diagnosis: this.state.diagnosis,
            recommendation: this.state.recommendation
        };

        const diagnosisJson = JSON.stringify(diagnosisInformation);

        const hash = await uploadJson(diagnosisJson);

        if(this.state.isChallenge) {
            const accept = this.state.originalDiagnosis === this.state.diagnosis;

            diagnoseChallengedCase(this.props.caseAddress, hash, accept, (error, result) => {
                if(error !== null) {
                    this.onError(error);
                } else {
                    this.onSuccess();
                }
            });
        } else {
            diagnoseCase(this.props.caseAddress, hash, (error, result) => {
                if(error !== null) {
                    this.onError(error);
                } else {
                    this.onSuccess();
                }
            });
        }
    }

    onError = (error) => {
        this.setState({
            error: error,
            submitInProgress: false
        });
        
    }

    onSuccess = () => {
        this.setState({submitInProgress: false});
        this.setState({showThankYouModal: true});
    }

    render() {
        return (
            <div className="card">
                <form method="#" action="#">
                    <div className="card-header">
                        <h2 className="card-title">
                            Submit Diagnosis
                        </h2>
                    </div>
                    <div className="card-content">
                        <div className="form-group">
                            <label>Diagnosis</label>
                            <select onChange={this.updateDiagnosis} className="form-control" required>
                                <option disabled selected value> -- select an option -- </option>
                                <optgroup label="Infection / Mites Subcategory">
                                    <option value="Abscess">Abscess</option>
                                    <option value="Infected Wound (Possibly secondary to biopsy)">Infected Wound (Possibly secondary to biopsy)</option>
                                    <option value="Cellulitis">Cellulitis</option>
                                    <option value="Folliculitis">Folliculitis</option>
                                    <option value="Cold sores / Herpes Simplex Virus 1">Cold sores / Herpes Simplex Virus 1</option>
                                    <option value="Genital Vesicles / Genital Sores / Herpes Simplex Virus 2">Genital Vesicles / Genital Sores / Herpes Simplex Virus 2</option>
                                    <option value="Genital Warts / Condyloma Acuminata"> Genital Warts / Condyloma Acuminata</option>
                                    <option value="Scabies">Scabies</option>
                                    <option value="Lice">Lice</option>
                                    <option value="Onychomycosis">Onychomycosis</option>
                                    <option value="Tinea Corporis">Tinea Corporis</option>
                                    <option value="Tinea Manuum">Tinea Manuum</option>
                                    <option value="Tinea Pedis">Tinea Pedis</option>
                                    <option value="Tinea Cruris">Tinea Cruris</option>
                                    <option value="Sexually Transmitted Disease">Sexually Transmitted Disease</option>
                                </optgroup>
                                <optgroup label="Benign Growths / Benign Lesions / Nevi / Common Skin Findings Subcategory">
                                    <option value="Epidermoid Cyst">Epidermoid Cyst</option>
                                    <option value="Pilar Cyst">Pilar Cyst</option>
                                    <option value="Dilated Comedone">Dilated Comedone</option>
                                    <option value="Seborrheic Keratosis">Seborrheic Keratosis</option>
                                    <option value="Cherry Angioma">Cherry Angioma</option>
                                    <option value="Abrasion / Erosion">Abrasion / Erosion</option>
                                    <option value="Bruise / Ecchymosis">Bruise / Ecchymosis</option>
                                    <option value="Dry Skin / Xerosis">Dry Skin / Xerosis</option>
                                    <option value="Insect Bite / Arthropod Bite">Insect Bite / Arthropod Bite</option>
                                    <option value="Blister / Bulla">Blister / Bulla</option>
                                    <option value="Benign Nevus">Benign Nevus</option>
                                    <option value="Dysplastic nevus / Atypical Nevus">Dysplastic nevus / Atypical Nevus</option>
                                    <option value="Congenital nevus">Congenital nevus</option>
                                    <option value="Skin Tag / Acrochordon">Skin Tag / Acrochordon</option>
                                    <option value="Verruca Vulgaris / Common Warts">Verruca Vulgaris / Common Warts</option>
                                    <option value="Plantar Warts">Plantar Warts</option>
                                    <option value="Sunburn">Sunburn</option>
                                    <option value="Photodamage">Photodamage</option>
                                    <option value="Hypertrophic Scar">Hypertrophic Scar</option>
                                    <option value="Keloid">Keloid</option>
                                    <option value="Callus / Corn"> Callus / Corn</option>
                                    <option value="Ulcer">Ulcer</option>
                                    <option value="Rheumatoid Nodule">Rheumatoid Nodule</option>
                                    <option value="Milium / Milia">Milium / Milia</option>
                                    <option value="Fox Fordyce">Fox Fordyce</option>
                                    <option value="Talon Noir">Talon Noir</option>
                                    <option value="Flat wart">Flat wart</option>
                                    <option value="Solar Lentigo">Solar Lentigo</option>
                                    <option value="Mucosal Melanotic Macule">Mucosal Melanotic Macule</option>
                                    <option value="Freckle / Ephelid">Freckle / Ephelid</option>
                                    <option value="Nevus Spilus">Nevus Spilus</option>
                                    <option value="Syringoma">Syringoma</option>
                                    <option value="Sebaceous Hyperplasia">Sebaceous Hyperplasia</option>
                                    <option value="Lipoma">Lipoma</option>
                                    <option value="Vascular Malformation">Vascular Malformation</option>
                                    <option value="Lymphatic Malformation">Lymphatic Malformation</option>
                                    <option value="Angiokeratoma">Angiokeratoma</option>
                                    <option value="Glomus Tumor">Glomus Tumor</option>
                                    <option value="Halo Nevus">Halo Nevus</option>
                                    <option value="Halo Nevus">Halo Nevus</option>
                                    <option value="Lymphedema">Lymphedema</option>
                                </optgroup>
                                <optgroup label="Precancerous & Cancerous Growths / Lesions Subcategory">
                                    <option value="Basal Cell Carcinoma">Basal Cell Carcinoma</option>
                                    <option value="Squamous Cell Carcinoma">Squamous Cell Carcinoma</option>
                                    <option value="Melanoma">Melanoma</option>
                                    <option value="Sebaceous Carcinoma">Sebaceous Carcinoma</option>
                                    <option value="Squamous Cell Carcinoma Keratoacanthoma Type">Squamous Cell Carcinoma, Keratoacanthoma Type</option>
                                    <option value="Actinic Keratosis">Actinic Keratosis</option>
                                    <option value="Dermatofibrosarcoma Protuberans">Dermatofibrosarcoma Protuberans</option>
                                </optgroup>
                                <optgroup label="Acne / Rosacea / Periorificial Dermatitis Subcategory">
                                    <option value="Mild Acne">Mild Acne</option>
                                    <option value="Moderate Acne">Moderate Acne</option>
                                    <option value="Severe / Nodulocystic Acne">Severe / Nodulocystic Acne</option>
                                    <option value="Neonatal Acne">Neonatal Acne</option>
                                    <option value="Infantile Acne">Infantile Acne</option>
                                    <option value="Papulopustular Rosacea">Papulopustular Rosacea</option>
                                    <option value="Erythematotelangiectatic Rosacea">Erythematotelangiectatic Rosacea</option>
                                    <option value="Ocular Rosacea">Ocular Rosacea</option>
                                    <option value="Rhinophyma">Rhinophyma</option>
                                    <option value="Perioral / Periorificial Dermatitis">Perioral / Periorificial Dermatitis</option>
                                </optgroup>
                                <optgroup label="Rashes Subcategory">
                                    <option value="Atopic Dermatitis / Eczema">Atopic Dermatitis / Eczema</option>
                                    <option value="Contact Dermatitis">Contact Dermatitis</option>
                                    <option value="Drug Rash">Drug Rash</option>
                                    <option value="Psoriasis">Psoriasis</option>
                                    <option value="Lichen Planus">Lichen Planus</option>
                                    <option value="Lichen Planus Pigmentosus">Lichen Planus Pigmentosus</option>
                                    <option value="Pityriasis Rosea">Pityriasis Rosea</option>
                                    <option value="Shingles / Herpes Zoster / VZV reactivation">Shingles / Herpes Zoster / VZV reactivation</option>
                                    <option value="Seborrheic Dermatitis">Seborrheic Dermatitis</option>
                                    <option value="Nummular Eczema">Nummular Eczema</option>
                                    <option value="Stasis Dermatitis">Stasis Dermatitis</option>
                                    <option value="Urticaria / Hives">Urticaria / Hives</option>
                                    <option value="Lupus">Lupus</option>
                                    <option value="Morphea">Morphea</option>
                                    <option value="Lichen Sclerosus et Atrophicus">Lichen Sclerosus et Atrophicus</option>
                                    <option value="Darier’s Disease">Darier's Disease</option>
                                    <option value="Hailey - Hailey Disease">Hailey - Hailey Disease</option>
                                    <option value="Granuloma Annulare">Granuloma Annulare</option>
                                    <option value="Necrobiosis Lipoidica Diabeticorum">Necrobiosis Lipoidica Diabeticorum</option>
                                    <option value="Necrobiotic Xanthogranuloma">Necrobiotic Xanthogranuloma</option>
                                    <option value="Sarcoidosis / Lupus Pernio">Sarcoidosis / Lupus Pernio</option>
                                    <option value="Angioedema">Angioedema</option>
                                    <option value="Erythema Chronicum Migrans">Erythema Chronicum Migrans</option>
                                    <option value="Mastocytosis">Mastocytosis</option>
                                    <option value="Erythema Ab Igne">Erythema Ab Igne</option>
                                    <option value="Macular Amyloidosis">Macular Amyloidosis</option>
                                    <option value="Lichen Amyloidosis">Lichen Amyloidosis</option>
                                    <option value="Nodular Amyloidosis">Nodular Amyloidosis</option>
                                    <option value="Prurigo Nodularis">Prurigo Nodularis</option>
                                    <option value="Lichen Simplex Chronicus">Lichen Simplex Chronicus</option>
                                    <option value="Notalgia Paresthetica">Notalgia Paresthetica</option>
                                    <option value="Palmoplantar Keratoderma">Palmoplantar Keratoderma</option>
                                    <option value="Vitiligo">Vitiligo</option>
                                    <option value="Poison Ivy / Poison Oak / Poison Sumac Contact Dermatitis">Poison Ivy / Poison Oak / Poison Sumac Contact Dermatitis</option>
                                </optgroup>
                                <optgroup label="Hair Loss / Alopecia Subcategory">
                                    <option value="Androgenetic Alopecia">Androgenetic Alopecia</option>
                                    <option value="Alopecia Areata">Alopecia Areata</option>
                                    <option value="Lichen Planopilaris">Lichen Planopilaris</option>
                                    <option value="Central Centrifugal Cicatricial Alopecia">Central Centrifugal Cicatricial Alopecia</option>
                                    <option value="Telogen Effluvium">Telogen Effluvium</option>
                                    <option value="Traction Alopecia">Traction Alopecia</option>
                                </optgroup>
                                <optgroup label="Other Subcategory">
                                    <option value="Juvenile Xanthogranuloma">Juvenile Xanthogranuloma</option>
                                    <option value="Lymphedema">Lymphedema</option>
                                    <option value="Nail pitting">Nail pitting</option>
                                    <option value="Onycholysis">Onycholysis</option>
                                    <option value="Pterygium">Pterygium</option>
                                    <option value="Idiopathic Guttate Hypomelanosis">Idiopathic Guttate Hypomelanosis</option>
                                    <option value="Progressive Macular hypomelanosis">Progressive Macular hypomelanosis</option>
                                    <option value="Erythema Toxicum Neonatorum">Erythema Toxicum Neonatorum</option>
                                    <option value="Transient Pustular Melanosis">Transient Pustular Melanosis</option>
                                    <option value="Becker’s Nevus">Becker's Nevus</option>
                                    <option value="Neoplasm of Uncertain Behavior">Neoplasm of Uncertain Behavior</option>
                                    <option value="Other">Other (Please fill in the box below)</option>
                                </optgroup>
                            </select>
                            <div>
                            { this.state.showOtherDiagnosisTextBox && <textarea onChange={this.updateOtherDiagnosis} className="form-control top10" rows="1" required /> }
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Recommendations</label>
                            <CheckboxTree
                                nodes={nodes}
                                checked={this.state.checked}
                                expanded={this.state.expanded}
                                onCheck={this.onCheck}
                                onExpand={this.onExpand}
                                showNodeIcon={false} />
                        </div>
                        <div>
                            { this.state.showOtherTextBox && <label>Other recommendations..</label> }
                            { this.state.showOtherTextBox && <textarea onChange={this.updateOtherRecommendation} className="form-control" rows="1" required /> }
                        </div>
                        <div className="row">
                            <div className="col-lg-6 col-md-6 top5">
                                <input onChange={this.checkFollowup} name="followUpCheckBox" id="followUp" type="checkBox" value="followUp" />
                                <label htmlFor="followUp">
                                    &nbsp;Follow up required?
                                </label>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="row">
                                <div className="col-lg-5 col-md-5">
                                    { this.state.showFollowUpTextBox && <label className="top10">Follow up with your primary care physician in, OR;</label> }
                                    { this.state.showFollowUpTextBox && <textarea onChange={this.updateFollowUp} placeholder="amount of time" id="primaryCare" className="form-control" rows="1" /> }
                                </div>
                                <div className="col-lg-4 col-md-4">
                                    { this.state.showFollowUpTextBox && <label className="top10">Consult a dermatologist in-person in, OR;</label> }
                                    { this.state.showFollowUpTextBox && <textarea onChange={this.updateFollowUp} placeholder="amount of time" id="dermatologist" className="form-control" rows="1" /> }
                                </div>
                                <div className="col-lg-3 col-md-3">
                                    { this.state.showFollowUpTextBox && <label className="top10">Reconsult teledermatology in</label> }
                                    { this.state.showFollowUpTextBox && <textarea onChange={this.updateFollowUp} placeholder="amount of time" id="teledermatology" className="form-control" rows="1" /> }
                                </div>
                            </div>                            
                        </div>
                        <div>
                            <button onClick={this.handleSubmit} type="submit" className="btn btn-fill btn-primary">Submit</button>
                        </div>
                    </div>
                </form>
                <Modal show={this.state.showEmptyDiagnosisFoundModal}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col text-center">
                                <h4>{this.state.incompleteDetailsModalMessage}</h4>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={this.handleEmptyDiagnosisFoundModal} type="button" className="btn btn-defult">Ok</button>
                    </Modal.Footer>
                </Modal>
                <Modal show={this.state.showConfirmationModal}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col text-center">
                                <h4>Are you sure?</h4>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={this.handleAcceptConfirmSubmissionModal} type="button" className="btn btn-defult">Yes</button>
                        <button onClick={this.handleCancelConfirmSubmissionModal} type="button" className="btn btn-defult">No</button>
                    </Modal.Footer>
                </Modal>
                <Modal show={this.state.showThankYouModal}>
                    <Modal.Body>
                        <div className="row">
                            <div className="col text-center">
                                <h4>Thank you! Your diagnosis submitted successfully.</h4>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={this.handleCloseThankYouModal} type="button" className="btn btn-defult">OK</button>
                    </Modal.Footer>
                </Modal>
                <Spinner loading={this.state.submitInProgress}/>
            </div>
        );
    }
}

SubmitDiagnosis.propTypes = {
    caseAddress: PropTypes.string
};

SubmitDiagnosis.defaultProps = {
    caseAddress: null
};

export default withRouter(SubmitDiagnosis);