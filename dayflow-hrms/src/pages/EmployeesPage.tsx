import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHRMS } from '../context/HRMSContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Search, Plus, Mail, MapPin, ArrowRight, Users } from 'lucide-react';
import { UserRole } from '../types/hrms';
import { formatDate } from '../utils/formatters';

export const EmployeesPage: React.FC = () => {
  const { allEmployees, isAdminOrHr } = useAuth();
  const { addEmployee } = useHRMS();

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // New Employee Modal state
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('Engineering');
  const [newRole, setNewRole] = useState<UserRole>('employee');
  const [newTitle, setNewTitle] = useState('');
  const [newCtc, setNewCtc] = useState<number>(100000);

  const departments = Array.from(new Set(allEmployees.map((e) => e.department)));

  const filteredEmployees = allEmployees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    addEmployee({
      fullName: newName,
      email: newEmail,
      department: newDept,
      role: newRole,
      designation: newTitle || 'Specialist',
      salaryStructure: {
        ctc: newCtc,
        basicMonthly: Math.round((newCtc * 0.5) / 12),
        hra: Math.round((newCtc * 0.25) / 12),
        conveyanceAllowance: 400,
        specialAllowance: Math.round((newCtc * 0.25) / 12),
        performanceBonus: 300,
        pfEmployee: Math.round((newCtc * 0.06) / 12),
        pfEmployer: Math.round((newCtc * 0.06) / 12),
        professionalTax: 200,
        incomeTaxTds: Math.round((newCtc * 0.12) / 12),
        healthInsurance: 150,
        grossMonthly: Math.round(newCtc / 12),
        netMonthly: Math.round(newCtc / 12 - ((newCtc * 0.18) / 12 + 350)),
      },
    });
    setAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewTitle('');
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-brand-600" />
            Employee Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {allEmployees.length} registered employees &bull; {allEmployees.filter((e) => e.status === 'active').length} active
          </p>
        </div>

        {isAdminOrHr && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setAddModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Onboard Employee
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_leave">On Leave</option>
        </select>
        <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'table' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-xs text-slate-400">
        Showing {filteredEmployees.length} of {allEmployees.length} employees
      </p>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <Card key={emp.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <img
                    src={emp.avatar}
                    alt={emp.fullName}
                    className="h-12 w-12 rounded-xl object-cover border-2 border-slate-100 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {emp.fullName}
                      </h3>
                      <Badge status={emp.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 truncate">{emp.designation}</p>
                    <p className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                      {emp.department}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{emp.workLocation} &bull; Joined {formatDate(emp.joiningDate)}</span>
                  </div>
                </div>

                <Link to={`/profile/${emp.id}`} className="mt-4 block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                  >
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-3">Employee</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Joined</th>
                    <th className="py-3 px-3 text-right">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={emp.avatar}
                            alt={emp.fullName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{emp.fullName}</div>
                            <div className="text-[10px] text-slate-400">{emp.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{emp.designation}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{emp.department}</td>
                      <td className="py-3 px-3 text-slate-500">{emp.email}</td>
                      <td className="py-3 px-3">
                        <Badge status={emp.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-slate-500">{formatDate(emp.joiningDate)}</td>
                      <td className="py-3 px-3 text-right">
                        <Link to={`/profile/${emp.id}`}>
                          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredEmployees.length === 0 && (
                <div className="py-10 text-center text-slate-400 text-xs">
                  No employees match the current filters.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onboard Employee Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Onboard New Employee"
        description="Add a new employee to the Dayflow HRMS system. They will receive access credentials via email."
        maxWidth="lg"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Sarah Johnson"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              label="Corporate Email"
              type="email"
              required
              placeholder="sarah.johnson@dayflow.corp"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Job Title / Designation"
              placeholder="e.g. Senior Engineer"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Department
              </label>
              <select
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product & Design">Product &amp; Design</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales & Growth">Sales &amp; Growth</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="employee">Employee</option>
                <option value="hr">HR Officer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Annual CTC ($)
              </label>
              <input
                type="number"
                min={30000}
                max={500000}
                value={newCtc}
                onChange={(e) => setNewCtc(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Onboard Employee
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};