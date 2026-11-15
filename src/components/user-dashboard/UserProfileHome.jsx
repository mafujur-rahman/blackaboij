"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Camera,
    User,
    Mail,
    Phone,
    MapPin,
    Building2,
    Hash,
    Lock,
    Pencil,
    Check,
    X,
    Eye,
    EyeOff,
    KeyRound,
    ShieldCheck,
    Loader2,
    Plus,
    AlertCircle,
    ChevronRight,
} from "lucide-react";
import UserDashboardShell from "./UserDashboardShell";
import Swal from "sweetalert2";
import api from "@/lib/axios";
import PhoneInput, { formatPhoneNumberIntl, isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dwsp8rft8/";
const MAX_IMAGE_MB = 5;

const FIELDS = [
    { key: "first_name", label: "First name", icon: User, type: "text", group: "personal", placeholder: "Enter first name" },
    { key: "last_name", label: "Last name", icon: User, type: "text", group: "personal", placeholder: "Enter last name" },
    { key: "email", label: "Email address", icon: Mail, type: "email", group: "contact", readOnly: true },
    { key: "phone_number", label: "Phone number", icon: Phone, type: "phone", group: "contact" },
    { key: "street_address", label: "Street address", icon: MapPin, type: "text", group: "address", placeholder: "House, road, area" },
    { key: "city", label: "City", icon: Building2, type: "text", group: "address", placeholder: "Enter city" },
    { key: "zip_code", label: "ZIP code", icon: Hash, type: "text", group: "address", placeholder: "Enter ZIP code" },
];

const GROUPS = [
    { id: "personal", title: "Personal information", description: "Your name as it appears on your account." },
    { id: "contact", title: "Contact details", description: "How we get in touch with you." },
    { id: "address", title: "Address", description: "Your saved location details." },
];

const EDITABLE_KEYS = FIELDS.filter((f) => !f.readOnly).map((f) => f.key);

const EMPTY_USER = {
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    profile_pic: null,
    street_address: "",
    city: "",
    zip_code: "",
};

const INPUT_CLS =
    "h-10 w-full rounded-lg border bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:ring-4";
const inputState = (hasError) =>
    hasError
        ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
        : "border-black/15 focus:border-black focus:ring-black/10";

const PHONE_WRAP =
    "flex h-10 items-center rounded-lg border bg-white px-3 transition focus-within:ring-4 [&_.PhoneInput]:flex [&_.PhoneInput]:w-full [&_.PhoneInput]:items-center [&_.PhoneInputInput]:h-full [&_.PhoneInputInput]:border-0 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:ring-0 [&_.PhoneInputInput]:focus:outline-none";

const toast = (icon, title) =>
    Swal.fire({
        toast: true,
        position: "top-end",
        icon,
        title,
        showConfirmButton: false,
        timer: 2600,
        timerProgressBar: true,
    });

const UserProfileHome = () => {
    const router = useRouter();
    const [user, setUser] = useState(EMPTY_USER); // saved data
    const [form, setForm] = useState(EMPTY_USER); // draft while editing
    const [errors, setErrors] = useState({});

    const [savedImage, setSavedImage] = useState(null); // url of the saved photo
    const [previewImage, setPreviewImage] = useState(null); // blob url of a new photo
    const [pendingImage, setPendingImage] = useState(null); // File waiting to be saved

    const [editingField, setEditingField] = useState(null);
    const [editAll, setEditAll] = useState(false);
    const [saving, setSaving] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    // Password
    const [pwdOpen, setPwdOpen] = useState(false);
    const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
    const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
    const [pwdError, setPwdError] = useState("");
    const [pwdLoading, setPwdLoading] = useState(false);

    const fileRef = useRef(null);

    const getToken = () => localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

    // ---------- Fetch ----------
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = getToken();
                if (!token) return;

                const res = await api.get("/api/user/get-my-profile/", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = {
                    first_name: res.data.first_name || "",
                    last_name: res.data.last_name || "",
                    email: res.data.email || "",
                    phone_number: res.data.phone_number || "",
                    profile_pic: null,
                    street_address: res.data.street_address || "",
                    city: res.data.city || "",
                    zip_code: res.data.zip_code || "",
                };
                setUser(data);
                setForm(data);
                setSavedImage(res.data.profile_pic ? `${CLOUDINARY_BASE}${res.data.profile_pic}` : null);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                toast("error", "Could not load your profile");
            } finally {
                setPageLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // ---------- Derived ----------
    const fullName = `${user.first_name} ${user.last_name}`.trim();
    const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();
    const displayImage = previewImage || savedImage;

    const completionItems = [
        { key: "first_name", label: "First name", done: !!user.first_name.trim() },
        { key: "last_name", label: "Last name", done: !!user.last_name.trim() },
        { key: "phone_number", label: "Phone number", done: !!user.phone_number },
        { key: "street_address", label: "Street address", done: !!user.street_address.trim() },
        { key: "city", label: "City", done: !!user.city.trim() },
        { key: "zip_code", label: "ZIP code", done: !!user.zip_code.trim() },
        { key: "photo", label: "Profile photo", done: !!displayImage },
    ];
    const completion = Math.round((completionItems.filter((i) => i.done).length / completionItems.length) * 100);
    const missingItems = completionItems.filter((i) => !i.done);

    const isDirty = EDITABLE_KEYS.some((k) => (form[k] || "") !== (user[k] || ""));

    // ---------- Validation ----------
    const validate = (vals, keys) => {
        const e = {};
        if (keys.includes("first_name") && !vals.first_name.trim()) e.first_name = "First name is required";
        if (keys.includes("last_name") && !vals.last_name.trim()) e.last_name = "Last name is required";
        if (keys.includes("phone_number")) {
            if (!vals.phone_number) e.phone_number = "Phone number is required";
            else if (vals.phone_number !== user.phone_number && !isValidPhoneNumber(vals.phone_number))
                e.phone_number = "Enter a valid phone number";
        }
        return e;
    };

    // ---------- Edit handlers ----------
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
    };

    const handlePhoneChange = (value) => {
        setForm((f) => ({ ...f, phone_number: value || "" }));
        if (errors.phone_number) setErrors((er) => ({ ...er, phone_number: undefined }));
    };

    const startFieldEdit = (key) => {
        setForm({ ...user });
        setErrors({});
        setEditAll(false);
        setEditingField(key);
        setTimeout(() => document.getElementById(`row-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    };

    const startEditAll = () => {
        setForm({ ...user });
        setErrors({});
        setEditingField(null);
        setEditAll(true);
    };

    const cancelEdit = () => {
        setForm({ ...user });
        setErrors({});
        setEditingField(null);
        setEditAll(false);
    };

    // ---------- Photo ----------
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        e.target.value = "";
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast("error", "Please choose an image file");
            return;
        }
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
            toast("error", `Image must be smaller than ${MAX_IMAGE_MB} MB`);
            return;
        }
        if (previewImage) URL.revokeObjectURL(previewImage);
        setPreviewImage(URL.createObjectURL(file));
        setPendingImage(file);
    };

    const cancelImage = () => {
        if (previewImage) URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
        setPendingImage(null);
    };

    // ---------- Save ----------
    const saveProfile = async (values, keys, imageFile = null) => {
        const merged = { ...user, ...values };
        const errs = validate(merged, keys);
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }

        setSaving(true);
        try {
            const token = getToken();
            if (!token) throw new Error("No auth token found");

            const payload = new FormData();
            payload.append("first_name", merged.first_name);
            payload.append("last_name", merged.last_name);
            payload.append("phone_number", merged.phone_number);
            payload.append("street_address", merged.street_address);
            payload.append("city", merged.city);
            payload.append("zip_code", merged.zip_code);
            if (imageFile) payload.append("profile_pic", imageFile);

            const res = await api.put("/api/user/update-my-profile/", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            const updated = res.data.data || {};
            const next = {
                ...merged,
                first_name: updated.first_name ?? merged.first_name,
                last_name: updated.last_name ?? merged.last_name,
                phone_number: updated.phone_number ?? merged.phone_number,
                street_address: updated.street_address ?? merged.street_address,
                city: updated.city ?? merged.city,
                zip_code: updated.zip_code ?? merged.zip_code,
                profile_pic: null,
            };
            setUser(next);
            setForm(next);

            if (updated.profile_pic) setSavedImage(`${CLOUDINARY_BASE}${updated.profile_pic}`);
            if (imageFile) cancelImage();

            setErrors({});
            setEditingField(null);
            setEditAll(false);
            toast("success", res.data.message || "Profile updated");
        } catch (error) {
            console.error("Update failed:", error);
            toast("error", error?.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveField = (key) => saveProfile({ [key]: form[key] }, [key]);
    const handleSaveAll = (e) => {
        e.preventDefault();
        saveProfile(form, EDITABLE_KEYS);
    };

    // ---------- Password ----------
    const pwdChecks = [
        { label: "8+ characters", ok: pwd.next.length >= 8 },
        { label: "Upper & lowercase", ok: /[a-z]/.test(pwd.next) && /[A-Z]/.test(pwd.next) },
        { label: "A number", ok: /\d/.test(pwd.next) },
        { label: "A symbol", ok: /[^A-Za-z0-9]/.test(pwd.next) },
    ];
    const pwdScore = pwdChecks.filter((c) => c.ok).length;
    const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong"][pwdScore];
    const strengthColor = ["bg-gray-200", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-600"][pwdScore];

    const closePassword = () => {
        setPwdOpen(false);
        setPwd({ current: "", next: "", confirm: "" });
        setShowPwd({ current: false, next: false, confirm: false });
        setPwdError("");
    };

    // Collect every string message from an API error response, whatever its shape
    const getMessages = (d) => {
        if (!d) return [];
        if (typeof d === "string") return [d];
        if (Array.isArray(d)) return d.flatMap(getMessages);
        if (typeof d === "object") return Object.values(d).flatMap(getMessages);
        return [];
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPwdError("");

        if (!pwd.current || !pwd.next || !pwd.confirm) return setPwdError("Fill in all three password fields.");
        if (pwd.next.length < 8) return setPwdError("Your new password must be at least 8 characters.");
        if (pwd.next !== pwd.confirm) return setPwdError("The new password and confirmation do not match.");
        if (pwd.next === pwd.current) return setPwdError("Your new password must be different from the current one.");

        setPwdLoading(true);
        try {
            const token = getToken();

            if (!token) {
                Swal.fire("Unauthorized", "Please login again.", "error");
                router.replace("/login");
                return;
            }

            const res = await api.post(
                "/api/user/change-password/",
                {
                    current_password: pwd.current,
                    new_password: pwd.next,
                    confirm_password: pwd.confirm,
                },
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (res.data.success) {
                // Replace the old token with the new one returned by the API.
                // Keep it in whichever storage the user originally used.
                if (localStorage.getItem("auth_token")) {
                    localStorage.setItem("auth_token", res.data.token);
                }
                if (sessionStorage.getItem("auth_token")) {
                    sessionStorage.setItem("auth_token", res.data.token);
                }

                closePassword();
                toast("success", res.data.message || "Password changed successfully.");
            } else {
                setPwdError(res.data?.message || "Could not change your password. Please try again.");
            }
        } catch (error) {
            console.error("Change password error:", error?.response?.data, error?.response?.status);

            const firstMessage =
                getMessages(error?.response?.data).find((m) => typeof m === "string" && m.trim()) ||
                "Something went wrong. Please try again.";

            const looksLikeWrongPassword =
                /current password|old password|incorrect password|wrong password|invalid password|password is incorrect/i.test(
                    firstMessage
                );

            setPwdError(
                looksLikeWrongPassword ? "Your current password is incorrect. Please try again." : firstMessage
            );
        } finally {
            setPwdLoading(false);
        }
    };

    // ---------- Inline render helpers ----------
    const renderPwdInput = (key, label, autoComplete) => (
        <div>
            <label htmlFor={`pwd-${key}`} className="mb-1.5 block text-sm font-medium text-gray-800">
                {label}
            </label>
            <div className="relative">
                <input
                    id={`pwd-${key}`}
                    type={showPwd[key] ? "text" : "password"}
                    value={pwd[key]}
                    autoComplete={autoComplete}
                    onChange={(e) => {
                        setPwd((p) => ({ ...p, [key]: e.target.value }));
                        if (pwdError) setPwdError("");
                    }}
                    className={`${INPUT_CLS} ${inputState(false)} pr-10`}
                />
                <button
                    type="button"
                    onClick={() => setShowPwd((s) => ({ ...s, [key]: !s[key] }))}
                    aria-label={showPwd[key] ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-black"
                >
                    {showPwd[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    );

    const renderInput = (f) => {
        const hasError = !!errors[f.key];
        const onKeyDown = (e) => {
            if (e.key === "Escape") cancelEdit();
            if (e.key === "Enter" && !editAll) {
                e.preventDefault();
                handleSaveField(f.key);
            }
        };

        if (f.type === "phone") {
            return (
                <div className={`${PHONE_WRAP} ${inputState(hasError)}`}>
                    <PhoneInput
                        id={`input-${f.key}`}
                        international
                        defaultCountry="BD"
                        value={form.phone_number}
                        onChange={handlePhoneChange}
                        onKeyDown={onKeyDown}
                    />
                </div>
            );
        }
        return (
            <input
                id={`input-${f.key}`}
                type={f.type}
                name={f.key}
                value={form[f.key]}
                onChange={handleFormChange}
                onKeyDown={onKeyDown}
                placeholder={f.placeholder}
                autoFocus={!editAll}
                aria-invalid={hasError}
                className={`${INPUT_CLS} ${inputState(hasError)}`}
            />
        );
    };

    const renderValue = (f) => {
        if (pageLoading) return <div className="h-4 w-44 animate-pulse rounded bg-gray-200" />;
        const raw = user[f.key];
        if (!raw) return <span className="text-sm text-gray-400">Not added</span>;
        const text = f.type === "phone" ? formatPhoneNumberIntl(raw) || raw : raw;
        return <span className="break-words text-sm font-medium text-gray-900">{text}</span>;
    };

    const renderRow = (f) => {
        const Icon = f.icon;
        const isEditing = (editAll && !f.readOnly) || editingField === f.key;

        return (
            <div
                id={`row-${f.key}`}
                key={f.key}
                className={`group grid gap-x-4 gap-y-2 px-6 py-4 transition-colors sm:grid-cols-[210px_minmax(0,1fr)_auto] ${
                    isEditing ? "bg-gray-100/70" : "hover:bg-gray-100/70"
                }`}
            >
                <label htmlFor={`input-${f.key}`} className="flex items-center gap-3 text-sm font-medium text-gray-600 sm:h-10">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors group-hover:bg-white group-hover:text-black group-hover:shadow-sm">
                        <Icon size={16} />
                    </span>
                    {f.label}
                </label>

                <div className="min-w-0">
                    {isEditing ? (
                        <>
                            {renderInput(f)}
                            {errors[f.key] && (
                                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                    <AlertCircle size={12} /> {errors[f.key]}
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="flex min-h-10 items-center">{renderValue(f)}</div>
                    )}
                </div>

                <div className="flex items-center gap-2 sm:h-10 sm:justify-end">
                    {f.readOnly ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                            <Lock size={12} /> Can&apos;t be changed
                        </span>
                    ) : editingField === f.key ? (
                        <>
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="h-9 rounded-lg border border-black/15 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSaveField(f.key)}
                                disabled={saving}
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-black px-3.5 text-sm font-medium text-white hover:bg-black/85 disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                Save
                            </button>
                        </>
                    ) : !editAll ? (
                        <button
                            type="button"
                            onClick={() => startFieldEdit(f.key)}
                            disabled={pageLoading}
                            aria-label={`Edit ${f.label}`}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-gray-600 transition hover:bg-white hover:text-black hover:shadow-sm disabled:opacity-40"
                        >
                            <Pencil size={14} /> Edit
                        </button>
                    ) : null}
                </div>
            </div>
        );
    };

    // ---------- Render ----------
    return (
        <UserDashboardShell user={user} setUser={setUser}>
            <div className="mx-auto w-full max-w-5xl">
                {/* Page header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">My profile</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage your personal information and keep your account secure.</p>
                    </div>
                    {!editAll && (
                        <button
                            type="button"
                            onClick={startEditAll}
                            disabled={pageLoading}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-medium text-white transition hover:bg-black/85 disabled:opacity-50"
                        >
                            <Pencil size={15} /> Edit all details
                        </button>
                    )}
                </div>

                <div className="space-y-6">
                    {/* TOP: profile card */}
                    <div className="rounded-xl border border-black/10 bg-white p-6">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center">
                            {/* Avatar */}
                            <div className="relative w-fit shrink-0">
                                {displayImage ? (
                                    <Image
                                        src={displayImage}
                                        alt="Profile photo"
                                        width={112}
                                        height={112}
                                        unoptimized={!!previewImage}
                                        className="h-28 w-28 rounded-full object-cover ring-4 ring-gray-100"
                                    />
                                ) : (
                                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gray-900 text-3xl font-semibold text-white ring-4 ring-gray-100">
                                        {pageLoading ? "" : initials || <User size={40} />}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    aria-label="Change profile photo"
                                    className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-gray-700 shadow-sm transition hover:bg-gray-100 hover:text-black"
                                >
                                    <Camera size={16} />
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </div>

                            {/* Name, email, photo actions */}
                            <div className="min-w-0 flex-1">
                                {pageLoading ? (
                                    <div className="space-y-2">
                                        <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
                                        <div className="h-4 w-60 animate-pulse rounded bg-gray-200" />
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="truncate text-xl font-semibold text-gray-900">{fullName || "Add your name"}</h2>
                                        <p className="mt-0.5 flex items-center gap-1.5 break-all text-sm text-gray-500">
                                            <Mail size={14} className="shrink-0" /> {user.email}
                                        </p>
                                        {user.phone_number && (
                                            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                                                <Phone size={14} className="shrink-0" /> {formatPhoneNumberIntl(user.phone_number) || user.phone_number}
                                            </p>
                                        )}
                                    </>
                                )}

                                {pendingImage ? (
                                    <div className="mt-4 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={cancelImage}
                                            className="h-9 rounded-lg border border-black/15 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => saveProfile({}, [], pendingImage)}
                                            disabled={saving}
                                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-black px-4 text-sm font-medium text-white hover:bg-black/85 disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                            Save photo
                                        </button>
                                    </div>
                                ) : (
                                    <p className="mt-3 text-xs text-gray-400">JPG, PNG or WebP, up to {MAX_IMAGE_MB} MB</p>
                                )}
                            </div>

                            {/* Completion */}
                            <div className="w-full md:w-80 md:shrink-0 md:border-l md:border-black/10 md:pl-6">
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="font-medium text-gray-700">Profile completion</span>
                                    <span className="font-semibold text-gray-900">{pageLoading ? "—" : `${completion}%`}</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${completion === 100 ? "bg-green-600" : "bg-black"}`}
                                        style={{ width: `${pageLoading ? 0 : completion}%` }}
                                    />
                                </div>

                                {!pageLoading && missingItems.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {missingItems.map((m) => (
                                            <button
                                                key={m.key}
                                                type="button"
                                                onClick={() => (m.key === "photo" ? fileRef.current?.click() : startFieldEdit(m.key))}
                                                className="inline-flex items-center gap-1 rounded-full border border-dashed border-black/25 px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:border-black hover:bg-gray-100 hover:text-black"
                                            >
                                                <Plus size={12} /> {m.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {!pageLoading && missingItems.length === 0 && (
                                    <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-green-700">
                                        <Check size={14} /> Your profile is complete
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: sections */}
                    <form onSubmit={handleSaveAll} className="space-y-6">
                        {GROUPS.map((g) => (
                            <section key={g.id} className="overflow-hidden rounded-xl border border-black/10 bg-white">
                                <div className="border-b border-black/10 px-6 py-4">
                                    <h3 className="text-base font-semibold text-gray-900">{g.title}</h3>
                                    <p className="mt-0.5 text-sm text-gray-500">{g.description}</p>
                                </div>
                                <div className="divide-y divide-black/5">{FIELDS.filter((f) => f.group === g.id).map((f) => renderRow(f))}</div>
                            </section>
                        ))}

                        {/* Security */}
                        <section className="overflow-hidden rounded-xl border border-black/10 bg-white">
                            <div className="border-b border-black/10 px-6 py-4">
                                <h3 className="text-base font-semibold text-gray-900">Security</h3>
                                <p className="mt-0.5 text-sm text-gray-500">Protect your account with a strong password.</p>
                            </div>

                            <div className="group grid gap-x-4 gap-y-2 px-6 py-4 transition-colors hover:bg-gray-100/70 sm:grid-cols-[210px_minmax(0,1fr)_auto]">
                                <div className="flex items-center gap-3 text-sm font-medium text-gray-600 sm:h-10">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors group-hover:bg-white group-hover:text-black group-hover:shadow-sm">
                                        <KeyRound size={16} />
                                    </span>
                                    Password
                                </div>
                                <div className="flex min-h-10 items-center text-sm tracking-widest text-gray-900">••••••••••••</div>
                                <div className="flex items-center sm:h-10 sm:justify-end">
                                    {!pwdOpen && (
                                        <button
                                            type="button"
                                            onClick={() => setPwdOpen(true)}
                                            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-gray-600 transition hover:bg-white hover:text-black hover:shadow-sm"
                                        >
                                            Change password <ChevronRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {pwdOpen && (
                                <div className="border-t border-black/5 bg-gray-50/80 px-6 py-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-4">
                                            {renderPwdInput("current", "Current password", "current-password")}
                                            {renderPwdInput("next", "New password", "new-password")}
                                            {renderPwdInput("confirm", "Confirm new password", "new-password")}
                                        </div>

                                        <div>
                                            <div className="mb-1.5 flex items-center justify-between text-sm">
                                                <span className="font-medium text-gray-800">Password strength</span>
                                                <span className="text-xs font-medium text-gray-500">{pwd.next ? strengthLabel : "—"}</span>
                                            </div>
                                            <div className="flex gap-1.5">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                                                            pwd.next && i <= pwdScore ? strengthColor : "bg-gray-200"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <ul className="mt-4 space-y-2">
                                                {pwdChecks.map((c) => (
                                                    <li key={c.label} className="flex items-center gap-2 text-sm">
                                                        <span
                                                            className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors ${
                                                                c.ok ? "bg-green-600 text-white" : "bg-gray-200 text-gray-400"
                                                            }`}
                                                        >
                                                            <Check size={12} />
                                                        </span>
                                                        <span className={c.ok ? "text-gray-900" : "text-gray-500"}>{c.label}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {pwdError && (
                                        <p className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                                            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {pwdError}
                                        </p>
                                    )}

                                    <div className="mt-6 flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={closePassword}
                                            className="h-10 rounded-lg border border-black/15 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handlePasswordSubmit}
                                            disabled={pwdLoading}
                                            className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-5 text-sm font-medium text-white hover:bg-black/85 disabled:opacity-50"
                                        >
                                            {pwdLoading ? (
                                                <>
                                                    <Loader2 size={15} className="animate-spin" /> Updating…
                                                </>
                                            ) : (
                                                <>
                                                    <ShieldCheck size={15} /> Update password
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Sticky save bar for "Edit all details" */}
                        {editAll && (
                            <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border border-black/10 bg-white/95 px-5 py-3.5 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                                <p className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className={`h-2 w-2 rounded-full ${isDirty ? "bg-orange-500" : "bg-gray-300"}`} />
                                    {isDirty ? "You have unsaved changes" : "No changes yet"}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-black/15 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        <X size={15} /> Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving || !isDirty}
                                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-black px-5 text-sm font-medium text-white hover:bg-black/85 disabled:opacity-40"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 size={15} className="animate-spin" /> Saving…
                                            </>
                                        ) : (
                                            "Save changes"
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </UserDashboardShell>
    );
};

export default UserProfileHome;