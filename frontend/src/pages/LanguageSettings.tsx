import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, DollarSign, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const LanguageSettings = () => {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState("EN");
  const [selectedCurrency, setSelectedCurrency] = useState("AED");

  const languages = [
    { 
      code: "EN", 
      name: "English", 
      nativeName: "English",
      flag: "🇺🇸",
      description: "Default language"
    },
    { 
      code: "AR", 
      name: "Arabic", 
      nativeName: "العربية",
      flag: "🇸🇦",
      description: "الترجمة"
    },
    { 
      code: "UR", 
      name: "Urdu", 
      nativeName: "اردو",
      flag: "🇵🇰",
      description: "اردو ترجمہ"
    },
    { 
      code: "HI", 
      name: "Hindi", 
      nativeName: "हिन्दी",
      flag: "🇮🇳",
      description: "हिंदी अनुवाद"
    },
    { 
      code: "FR", 
      name: "French", 
      nativeName: "Français",
      flag: "🇫🇷",
      description: "Traduction française"
    },
    { 
      code: "ES", 
      name: "Spanish", 
      nativeName: "Español",
      flag: "🇪🇸",
      description: "Traducción española"
    },
  ];

  const currencies = [
    { code: "AED", name: "United Arab Emirates Dirham", symbol: "د.إ", default: true },
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "SAR", name: "Saudi Riyal", symbol: "ر.س" },
    { code: "BHD", name: "Bahraini Dinar", symbol: "د.ب" },
    { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك" },
    { code: "OMR", name: "Omani Rial", symbol: "ر.ع" },
    { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق" },
    { code: "EGP", name: "Egyptian Pound", symbol: "ج.م" },
    { code: "JOD", name: "Jordanian Dinar", symbol: "د.أ" },
    { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
    { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  ];

  const handleSaveChanges = () => {
    // Here you would typically save to localStorage or send to API
    localStorage.setItem('selectedLanguage', selectedLanguage);
    localStorage.setItem('selectedCurrency', selectedCurrency);
    
    toast({
      title: "Settings Saved",
      description: `Language: ${languages.find(l => l.code === selectedLanguage)?.name}, Currency: ${selectedCurrency}`,
    });
  };

  const handleCancel = () => {
    // Reset to saved values or navigate back
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to BitStores</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Language Settings</h1>
            <p className="text-muted-foreground">
              Select the language you prefer for browsing, shopping, and communications.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Language Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Language Selection
                </CardTitle>
                <CardDescription>
                  Choose your preferred language for the interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {languages.map((language) => (
                  <motion.button
                    key={language.code}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedLanguage(language.code)}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      selectedLanguage === language.code
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/50 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{language.flag}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{language.nativeName}</span>
                            <span className="text-sm text-muted-foreground">- {language.code}</span>
                          </div>
                          {language.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {language.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedLanguage === language.code && (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </CardContent>
            </Card>

            {/* Currency Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Currency Settings
                </CardTitle>
                <CardDescription>
                  Select the currency you want to shop with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {currencies.map((currency) => (
                    <motion.button
                      key={currency.code}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedCurrency(currency.code)}
                      className={`w-full p-3 rounded-md border text-left transition-all text-sm ${
                        selectedCurrency === currency.code
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-semibold text-primary">
                            {currency.symbol}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{currency.code}</span>
                              <span className="text-muted-foreground">- {currency.name}</span>
                              {currency.default && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {selectedCurrency === currency.code && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {selectedCurrency === "PKR" && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <div className="text-xs text-amber-800 dark:text-amber-200">
                        <p className="font-medium mb-1">Note:</p>
                        <p>
                          You will be shown prices in PKR - Pakistani Rupee on BitStores as a reference only. 
                          You may or may not be able to pay in PKR, see more details during checkout.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-border">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} className="px-8">
              Save Changes
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LanguageSettings;