'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Close, Filter, Mail, MoreVert, Phone, PlusOne, Search, Shield, Visibility, VisibilityOff, LocationOn } from 'google-material-icons/outlined';
import { usePermissions } from '@/src/context/PermissionsContext';

interface CreateStaffFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  temporaryPassword: string;
  roleId: string;
  branchId: string;
  mustChangePassword: boolean;
}

interface StaffItem {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  branch: string;
  isActive: boolean;
}

export default function StaffManagementPage() {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('');
  const [createError, setCreateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateStaffFormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    temporaryPassword: '',
    roleId: '',
    branchId: '',
    mustChangePassword: true,
  });

  const [rolesList, setRolesList] = useState<{ id: string; name: string }[]>([]);
  const [availableBranches, setAvailableBranches] = useState<{ id: string; name: string }[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);

  const fetchStaffAndRoles = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // 1. Fetch Staff Members
      const staffRes = await fetch('/api/graphql', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          query: `
            query GetStaffMembers {
              staffMembers {
                id
                fullName
                email
                phoneNumber
                role
                branch
                isActive
              }
            }
          `,
        }),
      });
      const staffResult = await staffRes.json();
      if (staffResult?.data?.staffMembers) {
        setStaffList(staffResult.data.staffMembers);
      }

      // 2. Fetch Roles from DB
      const rolesRes = await fetch('/api/graphql', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          query: `
            query GetRoles {
              roles {
                id
                name
              }
            }
          `,
        }),
      });
      const rolesResult = await rolesRes.json();
      if (rolesResult?.data?.roles) {
        setRolesList(
          rolesResult.data.roles.map((r: { id: string; name: string }) => ({
            id: r.name.toUpperCase().replace(/\s+/g, '_'),
            name: r.name,
          }))
        );
      }

      // 3. Fetch Branches from DB
      const branchRes = await fetch('/api/graphql', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          query: `
            query GetStaffBranches {
              branches {
                id
                branchName
              }
            }
          `,
        }),
      });
      const branchResult = await branchRes.json();
      if (branchResult?.data?.branches) {
        setAvailableBranches(
          branchResult.data.branches.map((b: { id: string; branchName: string }) => ({
            id: b.branchName,
            name: b.branchName,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch staff members, roles, or branches:', err);
    }
  }, []);

  useEffect(() => {
    fetchStaffAndRoles();
  }, [fetchStaffAndRoles]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setIsSubmitting(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: `
            mutation CreateStaff($input: CreateStaffInput!) {
              createStaff(input: $input) {
                id
                fullName
                email
                phoneNumber
                role
                branch
                isActive
              }
            }
          `,
          variables: {
            input: {
              fullName: formData.fullName,
              email: formData.email,
              phoneNumber: formData.phoneNumber || null,
              temporaryPassword: formData.temporaryPassword,
              role: formData.roleId,
              branchId: formData.branchId,
              mustChangePassword: formData.mustChangePassword,
            },
          },
        }),
      });

      const result = await response.json();
      if (result.errors?.length) {
        throw new Error(result.errors[0].message || 'Failed to create staff member');
      }

      if (result.data?.createStaff) {
        setStaffList((prev) => [result.data.createStaff, ...prev]);
        setFormData({
          fullName: '',
          email: '',
          phoneNumber: '',
          temporaryPassword: '',
          roleId: '',
          branchId: '',
          mustChangePassword: true,
        });
        setIsDrawerOpen(false);
      }
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRoleFilter
      ? staff.role === selectedRoleFilter
      : true;
    const matchesBranch = selectedBranchFilter
      ? staff.branch === selectedBranchFilter
      : true;
    return matchesSearch && matchesRole && matchesBranch;
  });

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg text-[var(--color-on-surface)]">
            Team Members
          </h1>
          <p className="text-body-sm text-[var(--color-on-surface-variant)] mt-1">
            Manage staff accounts, assign operational roles, and set branch locations.
          </p>
        </div>
        {canCreate('settings') && (
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-[var(--color-on-primary)] px-4 py-2.5 rounded-[var(--radius-default)] font-medium text-body-sm transition-colors cursor-pointer"
          >
            <PlusOne size={18} />
            Add New Staff
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--color-surface-container-lowest)] p-4 rounded-[var(--radius-lg)] border border-[var(--color-outline-variant)] mb-6 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-outline)]"
          />
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-body-sm border border-[var(--color-outline-variant)] rounded-[var(--radius-default)] bg-[var(--color-surface-bright)] focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter
              size={18}
              className="text-[var(--color-outline)] hidden sm:block"
            />
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 text-body-sm border border-[var(--color-outline-variant)] rounded-[var(--radius-default)] bg-[var(--color-surface-container-lowest)] focus:outline-none"
            >
              <option value="">All Roles</option>
              {rolesList.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 text-body-sm border border-[var(--color-outline-variant)] rounded-[var(--radius-default)] bg-[var(--color-surface-container-lowest)] focus:outline-none"
          >
            <option value="">All Branches</option>
            {availableBranches.map((branch) => (
              <option key={branch.id} value={branch.name}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-[var(--color-surface-container-lowest)] rounded-[var(--radius-lg)] border border-[var(--color-outline-variant)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] text-label-caps">
              <tr>
                <th className="py-3.5 px-4">Staff Name</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Branch</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-outline-variant)]">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-[var(--color-surface-container-low)] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[var(--radius-full)] bg-[var(--color-primary-fixed)] text-[var(--color-on-primary-fixed)] font-semibold flex items-center justify-center text-body-sm">
                          {staff.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="font-medium text-body-sm text-[var(--color-on-surface)]">
                            {staff.fullName}
                          </p>
                          <p className="text-body-sm text-[var(--color-on-surface-variant)] text-xs">
                            {staff.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-full)] text-xs font-medium bg-[var(--color-surface-container-low)] text-[var(--color-primary)] border border-[var(--color-outline-variant)]">
                        <Shield size={14} />
                        {staff.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-body-sm text-[var(--color-on-surface-variant)]">
                      <div className="flex items-center gap-1.5">
                        <LocationOn
                          size={16}
                          className="text-[var(--color-outline)]"
                        />
                        {staff.branch}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-data-tabular text-[var(--color-on-surface-variant)]">
                      {staff.phoneNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      {staff.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary-fixed)]/30 px-2 py-0.5 rounded-[var(--radius-sm)]">
                          <CheckCircle size={14} />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-outline)] bg-[var(--color-surface-container)] px-2 py-0.5 rounded-[var(--radius-sm)]">
                          <Close size={14} />
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button className="p-1.5 hover:bg-[var(--color-surface-container-high)] rounded-[var(--radius-default)] text-[var(--color-on-surface-variant)] transition-colors cursor-pointer">
                        <MoreVert size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-body-sm text-[var(--color-on-surface-variant)]"
                  >
                    No staff members found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Component */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-black/40 transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[var(--color-surface-container-lowest)] shadow-2xl flex flex-col justify-between">
              <div className="p-6 border-b border-[var(--color-outline-variant)] flex items-center justify-between bg-[var(--color-surface-container-low)]">
                <div>
                  <h2 className="text-headline-lg-mobile text-[var(--color-on-surface)]">
                    Add New Staff
                  </h2>
                  <p className="text-body-sm text-[var(--color-on-surface-variant)] text-xs mt-0.5">
                    Set up credentials and assign operational privileges.
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-[var(--color-outline)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)] rounded-[var(--radius-default)] transition-colors cursor-pointer"
                >
                  <Close size={20} />
                </button>
              </div>

              <form
                id="create-staff-form"
                onSubmit={handleCreateStaffSubmit}
                className="p-6 space-y-6 overflow-y-auto flex-1"
              >
                <div>
                  <label className="block text-label-caps text-[var(--color-on-surface-variant)] mb-2">
                    Full Name <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="e.g. Sarah Ojo"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 text-body-sm border border-[var(--color-outline-variant)] rounded-[var(--radius-default)] bg-[var(--color-surface-bright)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-label-caps text-[var(--color-on-surface-variant)] mb-2">
                    Official Email <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-outline)]"
                    />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="sarah@businesshub.ng"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3.5 py-2.5 text-body-sm border border-[var(--color-outline-variant)] rounded-[var(--radius-default)] bg-[var(--color-surface-bright)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label-caps text-[var(--color-on-surface-variant)] mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-outline)]"
                    />
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="+234 808 123 4567"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3.5 py-2.5 text-body-sm border border-[var(--color-outline-variant)] rounded-[var(--radius-default)] bg-[var(--color-surface-bright)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label-caps text-[var(--color-on-surface-variant)] mb-2">
                    Temporary Password <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="temporaryPassword"
                      required
                      placeholder="••••••••"
                      value={formData.temporaryPassword}
                      onChange={handleInputChange}
                      className="w-full pl-3.5 pr-10 py-2.5 text-body-sm border border-[var(--color-outline-variant)] rounded-[var(--radius-default)] bg-[var(--color-surface-bright)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-outline)] hover:text-[var(--color-on-surface)] cursor-pointer"
                    >
                      {showPassword ? <VisibilityOff size={18} /> : <Visibility size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-label-caps text-[var(--color-on-surface-variant)] mb-2">
                    Assigned Role <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <select
                    name="roleId"
                    required
                    value={formData.roleId}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 text-body-sm border border-[var(--color-outline-variant)] rounded-[var(--radius-default)] bg-[var(--color-surface-container-lowest)] focus:outline-none"
                  >
                    <option value="">Select a role...</option>
                    {rolesList.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-label-caps text-[var(--color-on-surface-variant)] mb-2">
                    Assigned Branch <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <select
                    name="branchId"
                    required
                    value={formData.branchId}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 text-body-sm border border-[var(--color-outline-variant)] rounded-[var(--radius-default)] bg-[var(--color-surface-container-lowest)] focus:outline-none"
                  >
                    <option value="">Select a branch...</option>
                    {availableBranches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                {createError ? (
                  <div className="p-3 text-xs rounded-md bg-error-container text-error border border-error/20">
                    {createError}
                  </div>
                ) : null}

                <div className="pt-2 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="mustChangePassword"
                    name="mustChangePassword"
                    checked={formData.mustChangePassword}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 rounded-[var(--radius-sm)] border-[var(--color-outline-variant)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <label
                    htmlFor="mustChangePassword"
                    className="text-body-sm text-[var(--color-on-surface-variant)] text-xs cursor-pointer"
                  >
                    <span className="font-medium text-[var(--color-on-surface)] block">
                      Require password change
                    </span>
                    Staff member will be prompted to create a new password on their first login.
                  </label>
                </div>
              </form>

              <div className="p-4 border-t border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 text-body-sm font-medium text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] rounded-[var(--radius-default)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="create-staff-form"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-body-sm font-medium text-[var(--color-on-primary)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] disabled:opacity-60 disabled:cursor-not-allowed rounded-[var(--radius-default)] transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Saving Staff...' : 'Save Staff Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}