'use client';

import { useState } from 'react';
import { EmergencyContact } from '../../types';

interface EmergencyContactListProps {
  contacts: EmergencyContact[];
  title?: string;
}

export default function EmergencyContactList({
  contacts,
  title = 'Emergency Contacts',
}: EmergencyContactListProps) {
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(
    new Set(contacts.map((contact) => contact.category))
  ).sort();

  const filteredContacts = contacts.filter((contact) => {
    const matchesFilter =
      contact.name.toLowerCase().includes(filter.toLowerCase()) ||
      contact.phone_numbers.some((phone) => phone.includes(filter)) ||
      (contact.description || '').toLowerCase().includes(filter.toLowerCase());

    const matchesCategory = selectedCategory ? contact.category === selectedCategory : true;

    return matchesFilter && matchesCategory;
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>

      <div className="mt-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="w-full md:w-2/3">
          <label htmlFor="filter" className="sr-only">
            Search contacts
          </label>
          <input
            type="text"
            id="filter"
            placeholder="Search contacts by name, phone number, or description"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div className="w-full md:w-1/3">
          <label htmlFor="category" className="sr-only">
            Filter by category
          </label>
          <select
            id="category"
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-hidden bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <li key={contact.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="truncate text-lg font-medium text-blue-600">{contact.name}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {contact.description || 'Emergency Services'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      {contact.is_national ? (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          National
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          {contact.state}
                          {contact.city && ` - ${contact.city}`}
                        </span>
                      )}
                      <span className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        {contact.category.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {contact.phone_numbers.map((phone) => (
                        <a
                          key={phone}
                          href={`tel:${phone}`}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          {phone}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-4 text-center text-gray-500 sm:px-6">
              No emergency contacts found matching your search criteria.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
} 