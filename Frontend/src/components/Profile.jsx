import { useSelector } from "react-redux";
import Navbar from "./shared/Navbar";
import UpdateProfileDialog from "./UpdateProfileDialog";
import AppliedJobTable from "./AppliedJobTable";
import { Mail, Phone, FileText } from "lucide-react";

const Profile = () => {
  // Logged-in user ki details Redux Auth se milengi
  const user = useSelector((state) => state.auth.user);

  const name = user?.fullname || "Your Name";
  const email = user?.email || "Email not available";
  const phone = user?.phoneNumber || "Not provided";
  const bio = user?.profile?.bio || "Add your bio";
  const skills = Array.isArray(user?.profile?.skills)
    ? user.profile.skills
    : [];
  const resumeName = user?.profile?.resumeOriginalName || "No resume uploaded";
  const profilePicture = user?.profile?.profilePicture;

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">
            Your Account
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            My <span className="text-purple-400">Profile</span>
          </h1>
        </div>

        {/* Profile overview */}
        <section className="rounded-2xl border border-white/10 bg-white/4 p-5 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Profile picture or initial */}
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="h-24 w-24 shrink-0 rounded-2xl border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-purple-600 to-fuchsia-600 text-3xl font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-2xl font-bold">{name}</h2>
                </div>

                <UpdateProfileDialog user={user} />
              </div>

              <p className="mt-4 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-gray-400">
                {bio}
              </p>
            </div>
          </div>
        </section>

        {/* Contact information */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/4 p-5 sm:p-7">
          <h2 className="text-lg font-bold">Contact Information</h2>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex min-w-0 items-start gap-3">
              <div className="rounded-lg bg-purple-500/10 p-3 text-purple-300">
                <Mail size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-gray-400">Email Address</p>
                <p className="mt-1 break-all text-sm font-medium">{email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-500/10 p-3 text-purple-300">
                <Phone size={20} />
              </div>

              <div>
                <p className="text-sm text-gray-400">Contact Number</p>
                <p className="mt-1 text-sm font-medium">{phone}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/4 p-5 sm:p-7">
          <h2 className="text-lg font-bold">Skills</h2>

          {skills.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-400">
              No skills added yet. Click Update Profile to add your skills.
            </p>
          )}
        </section>

        {/* Resume */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/4 p-5 sm:p-7">
          <h2 className="text-lg font-bold">Resume</h2>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-3 text-purple-300">
              <FileText size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="break-all text-sm font-medium">{resumeName}</p>
              <p className="mt-1 text-xs text-gray-400">
                {user?.profile?.resume
                  ? "Resume available"
                  : "No resume uploaded yet"}
              </p>
            </div>

            {user?.profile?.resume && (
              <a
                href={user.profile.resume}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-purple-400/30 px-4 py-2 text-sm text-purple-300 transition hover:bg-purple-500/10"
              >
                View Resume
              </a>
            )}
          </div>
        </section>

        {/* Applied jobs */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Applied Jobs</h2>
            <p className="mt-2 text-sm text-gray-400">
              Review the jobs you have applied for.
            </p>
          </div>

          <AppliedJobTable />
        </section>
      </main>
    </div>
  );
};

export default Profile;
