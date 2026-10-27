import { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { LoaderCircle, Upload } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { API_BASE_URL } from "@/utils/constant";
import { setUser } from "@/redux/authSlice";

const buildFormData = (user) => ({
  fullname: user?.fullname || "",
  email: user?.email || "",
  phoneNumber: user?.phoneNumber || "",
  bio: user?.profile?.bio || "",
  skills: Array.isArray(user?.profile?.skills)
    ? user.profile.skills.join(", ")
    : "",
});

const UpdateProfileDialog = ({ user }) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState(() => buildFormData(user));

  const [resume, setResume] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  // Load the latest saved details into the form every time the dialog opens.
  const handleOpenChange = (nextOpen) => {
    if (nextOpen) {
      setFormData(buildFormData(user));
      setResume(null);
      setProfilePicture(null);
    }

    setOpen(nextOpen);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("fullname", formData.fullname.trim());
    payload.append("email", formData.email.trim());
    payload.append("phoneNumber", formData.phoneNumber.trim());
    payload.append("bio", formData.bio);
    payload.append("skills", formData.skills);

    if (profilePicture) payload.append("profilePicture", profilePicture);
    if (resume) payload.append("file", resume);

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/profile/update`,
        payload,
        { withCredentials: true },
      );

      if (response.data.success) {
        dispatch(setUser(response.data.user));
        toast.success(response.data.message || "Profile updated successfully");
        setOpen(false);
      } else {
        toast.error(response.data.message || "Unable to update profile");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 text-white hover:bg-purple-500">
          Update Profile
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#10101b] text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Your Profile</DialogTitle>
          <DialogDescription className="text-gray-400">
            Edit your details and save your changes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullname">Full Name</Label>
            <Input
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
              className="border-white/10 bg-black/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="border-white/10 bg-black/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Contact Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="border-white/10 bg-black/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Write a short introduction"
              className="border-white/10 bg-black/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <Input
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, JavaScript, Python, SQL"
              className="border-white/10 bg-black/20"
            />
            <p className="text-xs text-gray-500">
              Separate skills with commas.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profilePicture">Profile Picture</Label>
            <Input
              id="profilePicture"
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
              className="border-white/10 bg-black/20 file:text-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
              className="border-white/10 bg-black/20 file:text-gray-300"
            />
            <p className="flex items-center gap-2 text-xs text-gray-500">
              <Upload size={14} />
              Choose a new file to replace your existing resume.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="border-white/10 bg-transparent text-white hover:bg-white/10"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500"
            >
              {loading && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              {loading ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfileDialog;
