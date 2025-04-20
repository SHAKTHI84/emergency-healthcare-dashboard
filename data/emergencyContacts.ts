import { EmergencyContact } from '../types';

export const nationalEmergencyContacts: EmergencyContact[] = [
  {
    id: '1',
    name: 'All-in-one Emergency Number',
    category: 'general',
    phone_numbers: ['112'],
    description: 'Unified emergency response number for all emergencies',
    is_national: true,
  },
  {
    id: '2',
    name: 'Police',
    category: 'law_enforcement',
    phone_numbers: ['100'],
    description: 'National police emergency contact',
    is_national: true,
  },
  {
    id: '3',
    name: 'Ambulance',
    category: 'medical',
    phone_numbers: ['102', '108'],
    description: 'National ambulance emergency services',
    is_national: true,
  },
  {
    id: '4',
    name: 'Fire Brigade',
    category: 'fire',
    phone_numbers: ['101'],
    description: 'National fire emergency services',
    is_national: true,
  },
  {
    id: '5',
    name: 'Women Helpline',
    category: 'women_safety',
    phone_numbers: ['1091', '181'],
    description: 'National women helpline for women in distress',
    is_national: true,
  },
  {
    id: '6',
    name: 'Child Helpline',
    category: 'child_safety',
    phone_numbers: ['1098'],
    description: 'National child helpline for children in distress',
    is_national: true,
  },
  {
    id: '7',
    name: 'COVID-19 Helpline',
    category: 'health',
    phone_numbers: ['1075'],
    description: 'National COVID-19 helpline for information and assistance',
    is_national: true,
  },
  {
    id: '8',
    name: 'Disaster Management',
    category: 'disaster',
    phone_numbers: ['1078'],
    description: 'National Disaster Management Authority helpline',
    is_national: true,
  },
  {
    id: '9',
    name: 'Senior Citizen Helpline',
    category: 'senior_citizens',
    phone_numbers: ['14567'],
    description: 'National helpline for senior citizens',
    is_national: true,
  },
  {
    id: '10',
    name: 'Railway Protection',
    category: 'railway',
    phone_numbers: ['1512'],
    description: 'Railway Protection Force helpline',
    is_national: true,
  },
];

export const stateEmergencyContacts: Record<string, EmergencyContact[]> = {
  'Delhi': [
    {
      id: 'del1',
      name: 'Delhi Police',
      category: 'law_enforcement',
      phone_numbers: ['100', '112', '011-23469200'],
      description: 'Delhi Police Control Room',
      state: 'Delhi',
      is_national: false,
    },
    {
      id: 'del2',
      name: 'AIIMS Delhi',
      category: 'medical',
      phone_numbers: ['011-26588500', '011-26588700'],
      description: 'All India Institute of Medical Sciences emergency services',
      state: 'Delhi',
      is_national: false,
    },
  ],
  'Maharashtra': [
    {
      id: 'mh1',
      name: 'Mumbai Police',
      category: 'law_enforcement',
      phone_numbers: ['100', '112', '022-22621855'],
      description: 'Mumbai Police Control Room',
      state: 'Maharashtra',
      city: 'Mumbai',
      is_national: false,
    },
    {
      id: 'mh2',
      name: 'Disaster Management Cell (Mumbai)',
      category: 'disaster',
      phone_numbers: ['022-22694725'],
      description: 'Mumbai Disaster Management Cell',
      state: 'Maharashtra',
      city: 'Mumbai',
      is_national: false,
    },
  ],
  'Karnataka': [
    {
      id: 'ka1',
      name: 'Bengaluru Police',
      category: 'law_enforcement',
      phone_numbers: ['100', '112', '080-22942222'],
      description: 'Bengaluru Police Control Room',
      state: 'Karnataka',
      city: 'Bengaluru',
      is_national: false,
    },
    {
      id: 'ka2',
      name: 'Bengaluru Fire Control Room',
      category: 'fire',
      phone_numbers: ['101', '080-22971500'],
      description: 'Bengaluru Fire and Emergency Services',
      state: 'Karnataka',
      city: 'Bengaluru',
      is_national: false,
    },
  ],
  'Tamil Nadu': [
    {
      id: 'tn1',
      name: 'Chennai Police',
      category: 'law_enforcement',
      phone_numbers: ['100', '112', '044-23452359'],
      description: 'Chennai Police Control Room',
      state: 'Tamil Nadu',
      city: 'Chennai',
      is_national: false,
    },
    {
      id: 'tn2',
      name: 'Chennai Ambulance',
      category: 'medical',
      phone_numbers: ['108', '044-24350000'],
      description: 'Chennai Ambulance Services',
      state: 'Tamil Nadu',
      city: 'Chennai',
      is_national: false,
    },
  ],
  'Gujarat': [
    {
      id: 'gj1',
      name: 'Ahmedabad Police',
      category: 'law_enforcement',
      phone_numbers: ['100', '112', '079-25630100'],
      description: 'Ahmedabad Police Control Room',
      state: 'Gujarat',
      city: 'Ahmedabad',
      is_national: false,
    },
    {
      id: 'gj2',
      name: 'Gujarat Emergency Medical Services',
      category: 'medical',
      phone_numbers: ['108'],
      description: 'Gujarat Emergency Medical Services',
      state: 'Gujarat',
      is_national: false,
    },
  ],
};

// Function to get all emergency contacts (national + state specific)
export const getAllEmergencyContacts = (state?: string): EmergencyContact[] => {
  if (!state) {
    return nationalEmergencyContacts;
  }
  
  const stateContacts = stateEmergencyContacts[state] || [];
  return [...nationalEmergencyContacts, ...stateContacts];
}; 