'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  Home,
  FileText,
  KeyRound,
  MapPin,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Container } from '@/components/common/Container';
import { Button } from '@/components/ui/button';
import { submitProperty } from '@/lib/api';
import { ListingType, PropertyType, PriceType, AreaUnit } from '@/types';
import { siteConfig } from '@/config/site';

const FACILITIES_LIST = [
  'Gas',
  'Electricity',
  'Water',
  'Parking',
  'Security',
  'Internet',
  'Lift',
  'Nearby school',
  'Nearby hospital',
  'Furnished',
];

export default function PostPropertyPage() {
  // Step navigation (1 to 9)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [listingType, setListingType] = useState<ListingType>('SALE');
  const [propertyType, setPropertyType] = useState<PropertyType>('HOUSE');

  // Location
  const [city] = useState('Lahore');
  const [area, setArea] = useState('Bahria Town');
  const [society, setSociety] = useState('');
  const [block, setBlock] = useState('');
  const [street, setStreet] = useState('');
  const [fullAddress, setFullAddress] = useState('');

  // Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [areaSize, setAreaSize] = useState('5');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('MARLA');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('3');
  const [kitchens, setKitchens] = useState('1');
  const [floors, setFloors] = useState('2');
  const [furnishedStatus, setFurnishedStatus] = useState<
    'UNFURNISHED' | 'SEMI_FURNISHED' | 'FURNISHED'
  >('UNFURNISHED');
  const [constructionStatus, setConstructionStatus] = useState<
    'READY' | 'UNDER_CONSTRUCTION' | 'RAW'
  >('READY');

  // Price & Budget
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('NEGOTIABLE');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');

  // Facilities
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([
    'Electricity',
    'Water',
    'Gas',
  ]);

  // Contact
  const [contactName, setContactName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [honeypot, setHoneypot] = useState('');

  // Images (Max 3)
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successData, setSuccessData] = useState<{
    referenceId: string;
    slug: string;
    status: string;
  } | null>(null);

  // Toggle facility
  const toggleFacility = (item: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]
    );
  };

  // Image Selection Handler (Up to 3 images)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} is not a valid format. Only JPG, PNG, and WebP are allowed.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5 MB size limit.`);
        continue;
      }
      if (selectedImages.length + validFiles.length < 3) {
        validFiles.push(file);
        validPreviews.push(URL.createObjectURL(file));
      } else {
        alert('Maximum of 3 images allowed.');
        break;
      }
    }

    setSelectedImages((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...validPreviews]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setValidationErrors([]);

    const formData = new FormData();
    if (honeypot) formData.append('_hp', honeypot);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('listingType', listingType);
    formData.append('propertyType', propertyType);
    formData.append('areaSize', areaSize);
    formData.append('areaUnit', areaUnit);

    if (listingType === 'WANTED') {
      if (budgetMin) formData.append('budgetMin', budgetMin);
      if (budgetMax) formData.append('budgetMax', budgetMax);
    } else {
      formData.append('price', price);
      formData.append('priceType', priceType);
    }

    // Location object
    const locationObj = {
      country: 'Pakistan',
      province: 'Punjab',
      city,
      area,
      society,
      block,
      street,
      fullAddress,
    };
    formData.append('location', JSON.stringify(locationObj));

    // Contact info
    const contactObj = {
      contactName,
      whatsappNumber,
      alternatePhone,
    };
    formData.append('contactInfo', JSON.stringify(contactObj));

    // Facilities
    formData.append('facilities', JSON.stringify(selectedFacilities));

    // Details (Bedrooms, etc.)
    const detailsObj: Record<string, unknown> = {};
    if (['HOUSE', 'APARTMENT'].includes(propertyType)) {
      if (bedrooms) detailsObj.bedrooms = bedrooms;
      if (bathrooms) detailsObj.bathrooms = bathrooms;
      if (kitchens) detailsObj.kitchens = kitchens;
      if (floors) detailsObj.floors = floors;
      detailsObj.furnishedStatus = furnishedStatus;
      detailsObj.constructionStatus = constructionStatus;
    }
    formData.append('details', JSON.stringify(detailsObj));

    // Append images (Max 3)
    if (listingType !== 'WANTED') {
      selectedImages.forEach((img) => {
        formData.append('images', img);
      });
    }

    const response = await submitProperty(formData);

    setIsSubmitting(false);

    if (response.success && response.data) {
      setSuccessData(response.data);
    } else {
      setErrorMessage(response.message || 'Submission failed');
      if (response.errors) {
        setValidationErrors(response.errors);
      }
    }
  };

  // SUCCESS VIEW
  if (successData) {
    return (
      <div className="py-16 bg-navy-50/50 min-h-[75vh]">
        <Container>
          <div className="mx-auto max-w-xl rounded-3xl border border-brand-200 bg-white p-8 sm:p-12 text-center shadow-card">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 mb-6">
              <CheckCircle2 className="h-9 w-9 text-brand-600" />
            </div>

            <span className="rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
              Status: {successData.status} (Awaiting Admin Review)
            </span>

            <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-navy-950">
              Advertisement Submitted!
            </h1>

            <p className="mt-3 text-sm text-navy-600 leading-relaxed">
              Your property advertisement has been submitted successfully and is awaiting approval.
              Our moderation team reviews submissions promptly to maintain high marketplace standards.
            </p>

            <div className="mt-6 rounded-2xl bg-navy-50 border border-navy-200 p-4 text-left">
              <div className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
                Property Reference ID
              </div>
              <div className="mt-1 font-mono text-xl font-extrabold text-brand-700">
                {successData.referenceId}
              </div>
              <p className="mt-1 text-[11px] text-navy-500">
                Save this Reference ID for future inquiries or moderation tracking.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-brand-700 transition"
              >
                Return to Homepage
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccessData(null);
                  setCurrentStep(1);
                  setSelectedImages([]);
                  setImagePreviews([]);
                  setTitle('');
                  setDescription('');
                }}
                className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-6 py-3 text-xs sm:text-sm font-semibold text-navy-800 hover:bg-navy-50 transition"
              >
                Submit Another Property
              </button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const isResidential = ['HOUSE', 'APARTMENT'].includes(propertyType);

  return (
    <div className="py-12 bg-navy-50/50 min-h-screen">
      <Container>
        {/* Header Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-600 hover:text-brand-600 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>

          <span className="text-xs font-medium text-navy-500">
            Step {currentStep} of 9
          </span>
        </div>

        {/* Title */}
        <div className="max-w-2xl">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 border border-brand-200">
            Post an Advertisement
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
            List Your Property in Lahore
          </h1>
          <p className="mt-1 text-sm text-navy-600">
            Submit your residential, commercial, or wanted property advertisement with direct WhatsApp contact.
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="mt-8 grid grid-cols-9 gap-1.5 h-1.5 w-full bg-navy-200 rounded-full overflow-hidden">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div
              key={idx}
              className={`h-full transition-colors ${
                idx + 1 <= currentStep ? 'bg-brand-600' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Form Container */}
        <div className="mt-8 rounded-3xl border border-navy-100 bg-white p-6 sm:p-10 shadow-card max-w-3xl">
          {/* STEP 1: Advertisement Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy-950">Step 1: Choose Advertisement Purpose</h2>
                <p className="mt-1 text-xs text-navy-600">
                  Select whether you are selling, renting out, or seeking a property.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setListingType('SALE')}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition text-center ${
                    listingType === 'SALE'
                      ? 'border-brand-600 bg-brand-50/50 text-brand-900 shadow-sm'
                      : 'border-navy-100 hover:border-navy-200 bg-white text-navy-700'
                  }`}
                >
                  <Home className="h-8 w-8 text-brand-600 mb-2" />
                  <span className="font-bold text-sm">For Sale</span>
                  <span className="text-[11px] text-navy-500 mt-1">Sell a house, plot, or commercial space</span>
                </button>

                <button
                  type="button"
                  onClick={() => setListingType('RENT')}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition text-center ${
                    listingType === 'RENT'
                      ? 'border-brand-600 bg-brand-50/50 text-brand-900 shadow-sm'
                      : 'border-navy-100 hover:border-navy-200 bg-white text-navy-700'
                  }`}
                >
                  <KeyRound className="h-8 w-8 text-brand-600 mb-2" />
                  <span className="font-bold text-sm">For Rent</span>
                  <span className="text-[11px] text-navy-500 mt-1">Lease out a flat, house, or office</span>
                </button>

                <button
                  type="button"
                  onClick={() => setListingType('WANTED')}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition text-center ${
                    listingType === 'WANTED'
                      ? 'border-brand-600 bg-brand-50/50 text-brand-900 shadow-sm'
                      : 'border-navy-100 hover:border-navy-200 bg-white text-navy-700'
                  }`}
                >
                  <FileText className="h-8 w-8 text-brand-600 mb-2" />
                  <span className="font-bold text-sm">Property Wanted</span>
                  <span className="text-[11px] text-navy-500 mt-1">Publish requirements as a buyer or tenant</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Property Category */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy-950">Step 2: Property Category</h2>
                <p className="mt-1 text-xs text-navy-600">
                  Select the structural category of the property.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'HOUSE', label: 'House / Villa' },
                  { id: 'APARTMENT', label: 'Apartment / Flat' },
                  { id: 'PLOT', label: 'Plot' },
                  { id: 'SHOP', label: 'Shop / Retail' },
                  { id: 'OFFICE', label: 'Office' },
                  { id: 'COMMERCIAL_BUILDING', label: 'Commercial Plaza' },
                  { id: 'WAREHOUSE', label: 'Warehouse / Factory' },
                  { id: 'OTHER', label: 'Other Property' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setPropertyType(cat.id as PropertyType)}
                    className={`p-4 rounded-xl border-2 text-center text-xs font-bold transition ${
                      propertyType === cat.id
                        ? 'border-brand-600 bg-brand-50 text-brand-800 shadow-sm'
                        : 'border-navy-100 hover:border-navy-200 text-navy-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-navy-950">Step 3: Location in Lahore</h2>
                <p className="mt-1 text-xs text-navy-600">
                  Provide the area or society details for this listing.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    disabled
                    className="w-full rounded-xl border border-navy-200 bg-navy-50 py-2.5 px-3 text-xs text-navy-700 font-semibold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1">
                    Area / Society *
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full rounded-xl border border-navy-200 bg-white py-2.5 px-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                  >
                    {siteConfig.locations.filter(l => l.value !== 'lahore').map((loc) => (
                      <option key={loc.value} value={loc.label}>
                        {loc.label}
                      </option>
                    ))}
                    <option value="Custom Other Area">Other Lahore Area</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1">
                    Phase / Sector (Optional)
                  </label>
                  <input
                    type="text"
                    value={society}
                    onChange={(e) => setSociety(e.target.value)}
                    placeholder="e.g. Phase 5, Sector C"
                    className="w-full rounded-xl border border-navy-200 py-2.5 px-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1">
                    Block (Optional)
                  </label>
                  <input
                    type="text"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    placeholder="e.g. Block B, CCA"
                    className="w-full rounded-xl border border-navy-200 py-2.5 px-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-navy-700 mb-1">
                    Full Address / Street Note (Optional for Wanted)
                  </label>
                  <input
                    type="text"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="e.g. Street 14, Near Commercial Market"
                    className="w-full rounded-xl border border-navy-200 py-2.5 px-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Details */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-navy-950">Step 4: Property Details</h2>
                <p className="mt-1 text-xs text-navy-600">
                  Enter title, specifications, and description.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">
                  Advertisement Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern 1 Kanal Brand New Designer House in DHA Phase 6"
                  className="w-full rounded-xl border border-navy-200 py-2.5 px-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1">
                    Area Size *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={areaSize}
                    onChange={(e) => setAreaSize(e.target.value)}
                    placeholder="5"
                    className="w-full rounded-xl border border-navy-200 py-2.5 px-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1">
                    Area Unit *
                  </label>
                  <select
                    value={areaUnit}
                    onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
                    className="w-full rounded-xl border border-navy-200 py-2.5 px-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="MARLA">Marla</option>
                    <option value="KANAL">Kanal</option>
                    <option value="SQ_FT">Sq. Feet</option>
                    <option value="SQ_YD">Sq. Yards</option>
                  </select>
                </div>
              </div>

              {/* Conditional Residential Fields */}
              {isResidential && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-navy-100 pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-700 mb-1">Bedrooms</label>
                    <input
                      type="number"
                      min="0"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full rounded-xl border border-navy-200 py-2 px-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy-700 mb-1">Bathrooms</label>
                    <input
                      type="number"
                      min="0"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full rounded-xl border border-navy-200 py-2 px-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy-700 mb-1">Kitchens</label>
                    <input
                      type="number"
                      min="0"
                      value={kitchens}
                      onChange={(e) => setKitchens(e.target.value)}
                      className="w-full rounded-xl border border-navy-200 py-2 px-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy-700 mb-1">Furnished</label>
                    <select
                      value={furnishedStatus}
                      onChange={(e) =>
                        setFurnishedStatus(
                          e.target.value as 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FURNISHED'
                        )
                      }
                      className="w-full rounded-xl border border-navy-200 py-2 px-2 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                    >
                      <option value="UNFURNISHED">Unfurnished</option>
                      <option value="SEMI_FURNISHED">Semi Furnished</option>
                      <option value="FURNISHED">Furnished</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the condition, key features, layout, and nearby amenities..."
                  className="w-full rounded-xl border border-navy-200 py-2.5 px-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Price */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-navy-950">Step 5: Pricing (PKR)</h2>
                <p className="mt-1 text-xs text-navy-600">
                  {listingType === 'WANTED'
                    ? 'Specify your target budget bracket in Pakistani Rupees.'
                    : 'Set your demand price and negotiation terms.'}
                </p>
              </div>

              {listingType === 'WANTED' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-700 mb-1">
                      Min Budget (PKR)
                    </label>
                    <input
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      placeholder="e.g. 5000000"
                      className="w-full rounded-xl border border-navy-200 py-2.5 px-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy-700 mb-1">
                      Max Budget (PKR)
                    </label>
                    <input
                      type="number"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      placeholder="e.g. 15000000"
                      className="w-full rounded-xl border border-navy-200 py-2.5 px-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-700 mb-1">
                      {listingType === 'RENT' ? 'Rent Amount (PKR) *' : 'Demand Price (PKR) *'}
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={listingType === 'RENT' ? 'e.g. 65000' : 'e.g. 25000000'}
                      className="w-full rounded-xl border border-navy-200 py-2.5 px-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-700 mb-1">
                      Price Flexibility
                    </label>
                    <select
                      value={priceType}
                      onChange={(e) => setPriceType(e.target.value as PriceType)}
                      className="w-full rounded-xl border border-navy-200 py-2.5 px-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                    >
                      <option value="NEGOTIABLE">Negotiable</option>
                      <option value="FIXED">Fixed Demand</option>
                      {listingType === 'RENT' && <option value="MONTHLY">Monthly</option>}
                      {listingType === 'RENT' && <option value="YEARLY">Yearly</option>}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Facilities */}
          {currentStep === 6 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-navy-950">Step 6: Facilities & Amenities</h2>
                <p className="mt-1 text-xs text-navy-600">
                  Check all utility connections and neighborhood amenities available.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FACILITIES_LIST.map((item) => {
                  const isSelected = selectedFacilities.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleFacility(item)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50 text-brand-800'
                          : 'border-navy-100 hover:border-navy-200 text-navy-700 bg-white'
                      }`}
                    >
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-navy-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: Contact Information */}
          {currentStep === 7 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-navy-950">Step 7: Contact Information</h2>
                <p className="mt-1 text-xs text-navy-600">
                  Buyers and tenants will use your WhatsApp number to reach you directly.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Muhammad Ali"
                  className="w-full rounded-xl border border-navy-200 py-2.5 px-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">
                  WhatsApp Number *
                </label>
                <div className="relative">
                  <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="03001234567 or 923001234567"
                    className="w-full rounded-xl border border-navy-200 py-2.5 pl-10 pr-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-navy-500">
                  A direct WhatsApp chat button will appear on your listing for instant inquiries.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">
                  Alternate Phone (Optional)
                </label>
                <input
                  type="text"
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                  placeholder="Optional secondary number"
                  className="w-full rounded-xl border border-navy-200 py-2.5 px-3 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 8: Images */}
          {currentStep === 8 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-navy-950">Step 8: Property Images (Max 3)</h2>
                <p className="mt-1 text-xs text-navy-600">
                  {listingType === 'WANTED'
                    ? 'Wanted advertisements do not require property images. You may proceed directly to review.'
                    : 'Upload up to 3 authentic property photos (JPG, PNG, WebP up to 5 MB each).'}
                </p>
              </div>

              {listingType !== 'WANTED' ? (
                <div>
                  {selectedImages.length < 3 && (
                    <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-navy-300 rounded-2xl cursor-pointer hover:border-brand-500 hover:bg-brand-50/20 transition">
                      <Upload className="h-8 w-8 text-navy-400 mb-2" />
                      <span className="text-xs font-bold text-navy-800">
                        Select Images ({selectedImages.length}/3)
                      </span>
                      <span className="text-[11px] text-navy-500 mt-0.5">
                        JPEG, PNG, or WebP up to 5 MB
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  {/* Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative h-28 rounded-xl overflow-hidden border border-navy-200 group">
                          <Image
                            src={preview}
                            alt={`Preview ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 transition"
                            aria-label="Remove image"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-navy-200 bg-navy-50 p-4 text-xs text-navy-600">
                  Images are skipped for Property Wanted requirements.
                </div>
              )}
            </div>
          )}

          {/* STEP 9: Review and Submit */}
          {currentStep === 9 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-navy-950">Step 9: Review & Submit</h2>
                <p className="mt-1 text-xs text-navy-600">
                  Verify your advertisement details before sending to the approval queue.
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span>Submission Error:</span>
                  </div>
                  <p>{errorMessage}</p>
                  {validationErrors.length > 0 && (
                    <ul className="mt-2 list-disc pl-4 space-y-1">
                      {validationErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Summary Box */}
              <div className="rounded-2xl border border-navy-100 bg-navy-50/70 p-5 space-y-3 text-xs">
                <div className="flex justify-between border-b border-navy-200 pb-2">
                  <span className="text-navy-500">Advertisement Type:</span>
                  <span className="font-bold text-navy-900">{listingType}</span>
                </div>
                <div className="flex justify-between border-b border-navy-200 pb-2">
                  <span className="text-navy-500">Property Category:</span>
                  <span className="font-bold text-navy-900">{propertyType}</span>
                </div>
                <div className="flex justify-between border-b border-navy-200 pb-2">
                  <span className="text-navy-500">Title:</span>
                  <span className="font-bold text-navy-900 truncate max-w-xs">{title || '(Not set)'}</span>
                </div>
                <div className="flex justify-between border-b border-navy-200 pb-2">
                  <span className="text-navy-500">Location:</span>
                  <span className="font-bold text-navy-900">{area}, Lahore</span>
                </div>
                <div className="flex justify-between border-b border-navy-200 pb-2">
                  <span className="text-navy-500">Size:</span>
                  <span className="font-bold text-navy-900">{areaSize} {areaUnit}</span>
                </div>
                <div className="flex justify-between border-b border-navy-200 pb-2">
                  <span className="text-navy-500">Price / Demand:</span>
                  <span className="font-bold text-brand-700">
                    {listingType === 'WANTED'
                      ? `Budget: PKR ${budgetMin || '0'} - ${budgetMax || 'Any'}`
                      : `PKR ${price || '0'} (${priceType})`}
                  </span>
                </div>
                <div className="flex justify-between border-b border-navy-200 pb-2">
                  <span className="text-navy-500">Contact Person:</span>
                  <span className="font-bold text-navy-900">{contactName} ({whatsappNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-500">Attached Images:</span>
                  <span className="font-bold text-navy-900">{selectedImages.length} Image(s)</span>
                </div>
              </div>

              <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 text-xs text-brand-800">
                <span className="font-bold">Moderation Notice:</span> Upon submission, your advertisement
                will receive a unique Reference ID and enter our verification queue before becoming publicly visible.
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-navy-100 pt-5">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-navy-200 bg-white py-2.5 px-4 text-xs font-semibold text-navy-700 hover:bg-navy-50 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Previous Step
              </button>
            ) : <div />}

            {currentStep < 9 ? (
              <button
                type="button"
                onClick={() => {
                  // Basic client gate for step advancement
                  if (currentStep === 4 && (!title || !description)) {
                    alert('Please enter a title and description before proceeding.');
                    return;
                  }
                  if (currentStep === 7 && (!contactName || !whatsappNumber)) {
                    alert('Please enter your contact name and WhatsApp number.');
                    return;
                  }
                  setCurrentStep((prev) => prev + 1);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 py-2.5 px-6 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition"
              >
                Next Step
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 py-3 px-8 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-brand-700 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Submitting to Approval Queue...</span>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Submit for Approval</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
