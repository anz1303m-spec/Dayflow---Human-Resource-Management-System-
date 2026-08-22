import React from 'react';
import { User } from '../../types/hrms';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatDate } from '../../utils/formatters';
import { User as UserIcon, Phone, MapPin, HeartHandshake, Shield } from 'lucide-react';

export const PersonalDetailsTab: React.FC<{ employee: User }> = ({ employee }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Basic Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-brand-500" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold">Date of Birth</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{formatDate(employee.dob)}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Gender</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.gender}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Blood Group</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.bloodGroup}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Nationality / Status</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">United States</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4 text-brand-500" />
            <span>Contact &amp; Address</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold">Corporate Email</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.email}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Phone Number</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.phone}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Residential Address</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-rose-500" />
            <span>Emergency Contact</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold">Contact Name</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.emergencyContact.name}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Relationship</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.emergencyContact.relation}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Emergency Phone</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.emergencyContact.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
