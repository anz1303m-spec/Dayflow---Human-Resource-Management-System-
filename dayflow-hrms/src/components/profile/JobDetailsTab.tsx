import React from 'react';
import { User } from '../../types/hrms';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatDate } from '../../utils/formatters';
import { Briefcase, Building, Shield, UserCheck, Calendar } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const JobDetailsTab: React.FC<{ employee: User }> = ({ employee }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-brand-500" />
            <span>Position &amp; Role</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold">Employee ID</span>
              <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{employee.employeeId}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Role Privilege</span>
              <div className="mt-0.5"><Badge variant="brand" size="sm">{employee.role.toUpperCase()}</Badge></div>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Job Title</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.designation}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Department</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building className="h-4 w-4 text-brand-500" />
            <span>Employment Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold">Employment Type</span>
              <p className="font-semibold capitalize text-slate-900 dark:text-slate-100 mt-0.5">
                {employee.employmentType.replace('_', ' ')}
              </p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Employment Status</span>
              <div className="mt-0.5"><Badge status={employee.status} size="sm" /></div>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Date of Joining</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{formatDate(employee.joiningDate)}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Reporting Manager</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.reportingManager}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
