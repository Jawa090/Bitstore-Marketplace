import { useState } from "react";
import { X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onLocationChange: (location: string) => void;
}

const LocationModal = ({ isOpen, onClose, currentLocation, onLocationChange }: LocationModalProps) => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [zipInput, setZipInput] = useState("");

  const uaeCountries = [
    "Bahrain",
    "Kuwait", 
    "Oman",
    "Qatar",
    "Saudi Arabia"
  ];

  const savedAddresses = [
    { id: 1, name: "Home", address: "Dubai Marina, Dubai, UAE", isDefault: true },
    { id: 2, name: "Office", address: "Business Bay, Dubai, UAE", isDefault: false },
  ];

  const handleApply = () => {
    if (cityInput.trim()) {
      onLocationChange(cityInput.trim());
      onClose();
    }
  };

  const handleAddressSelect = (address: string) => {
    const city = address.split(",")[1]?.trim() || address.split(",")[0]?.trim();
    onLocationChange(city);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-foreground">
              Choose your delivery location
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
          {/* Info Text */}
          <p className="text-sm text-muted-foreground">
            Delivery options and delivery speeds may vary for different locations
          </p>

          {/* Sign in to see addresses */}
          <div className="bg-muted/30 rounded-lg p-4">
            <Button 
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
              onClick={() => {/* Handle sign in */}}
            >
              Sign in to see your addresses
            </Button>
          </div>

          {/* Saved Addresses (if any) */}
          {savedAddresses.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Your addresses</h3>
              {savedAddresses.map((address) => (
                <div
                  key={address.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/40 cursor-pointer transition-colors"
                  onClick={() => handleAddressSelect(address.address)}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{address.name}</span>
                      {address.isDefault && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{address.address}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Delivery options may vary for different locations
          </div>

          {/* Location Notice */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              We will use your selected location to show all products available for United Arab Emirates.
            </p>
          </div>

          {/* UAE City Input */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">or enter city/area</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter UAE city or area"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Zip code (optional)"
                value={zipInput}
                onChange={(e) => setZipInput(e.target.value)}
                className="w-32"
              />
            </div>
            <Button 
              onClick={handleApply}
              disabled={!cityInput.trim()}
              className="w-full sm:w-auto"
            >
              Apply
            </Button>
          </div>

          {/* Ship Outside UAE */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">or ship outside the UAE</p>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose country" />
              </SelectTrigger>
              <SelectContent>
                {uaeCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCountry && (
              <Button 
                onClick={() => {
                  onLocationChange(selectedCountry);
                  onClose();
                }}
                className="w-full sm:w-auto"
              >
                Choose
              </Button>
            )}
          </div>

          {/* Done Button */}
          <div className="pt-4 border-t border-border">
            <Button 
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Done
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationModal;