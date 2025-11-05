import { Bounty, User } from './types';

export const MOCK_BOUNTIES: Bounty[] = [
  {
    id: '1',
    title: 'Verify Coca-Cola Stock in Downtown Store',
    description: 'Check if the new Coca-Cola "Starlight" flavor is available on the main shelf of the specified convenience store.',
    requirements: ['Clear photo of the beverage aisle.', 'Photo must show the Coca-Cola section clearly.', 'GPS location must be enabled and match the store address.'],
    reward: 5,
    category: 'Retail Audit',
    location: 'Downtown Central',
    imageUrl: 'https://picsum.photos/seed/retail/400/200',
  },
  {
    id: '2',
    title: 'Report Pothole on Main Street',
    description: 'Find and photograph a large pothole on Main Street between 4th and 5th avenue. The photo should include a common object for scale (like a shoe or a water bottle).',
    requirements: ['Photo must clearly show the pothole.', 'Include a scale object.', 'Submission must be from the specified area.'],
    reward: 2.5,
    category: 'Civic Data',
    location: 'Main Street',
    imageUrl: 'https://picsum.photos/seed/civic/400/200',
  },
  {
    id: '3',
    title: 'Document Graffiti at City Park',
    description: 'Take a picture of the new graffiti art on the west wall of the City Park skate ramp.',
    requirements: ['High-resolution photo.', 'Must be the west wall.', 'No people in the photo.'],
    reward: 3,
    category: 'Urban Art',
    location: 'City Park',
    imageUrl: 'https://picsum.photos/seed/art/400/200',
  },
  {
    id: '4',
    title: 'Check EV Charging Station Status',
    description: 'Visit the public EV charging station at the Grand Mall and verify if all four stalls are operational.',
    requirements: ['Photo of the station screen showing its status.', 'Note any error messages.', 'Confirm if all charging spots are accessible.'],
    reward: 7,
    category: 'Infrastructure',
    location: 'Grand Mall',
    imageUrl: 'https://picsum.photos/seed/infra/400/200',
  },
];

// FIX: Updated CURRENT_USER to conform to the User interface.
export const CURRENT_USER: User = {
  id: 99,
  telegram_id: 99999,
  first_name: 'QuestTaker',
  wallet_address: 'EQB...jAA',
  balance: 125.5,
  created_at: new Date().toISOString(),
};
