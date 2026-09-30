"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Upload,
  MapPin,
  Droplets,
  Leaf,
  ImagePlus,
  X,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  IndianRupee,
  Calendar,
  FileText
} from "lucide-react"
import { apiRequest } from "@/lib/api"

const soilTypes = ["Black Soil", "Alluvial Soil", "Red Soil", "Laterite Soil", "Sandy Soil", "Clay Soil"]
const waterSources = ["Borewell", "Canal", "River", "Lake", "Pond", "Rainwater", "Tube Well"]
const waterLevels = ["Very High", "High", "Medium", "Low"]
const cropTypes = ["Rice", "Wheat", "Cotton", "Sugarcane", "Maize", "Soybean", "Groundnut", "Tea", "Coffee", "Vegetables", "Fruits"]

const steps = [
  { id: 1, title: "Basic Info", icon: FileText },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Land Details", icon: Leaf },
  { id: 4, title: "Images", icon: ImagePlus },
  { id: 5, title: "Pricing", icon: IndianRupee },
]

export default function UploadLandPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [images, setImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [ownershipProof, setOwnershipProof] = useState<File | null>(null)
  const [submissionError, setSubmissionError] = useState("")
  const [locationError, setLocationError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    state: "",
    district: "",
    address: "",
    latitude: "",
    longitude: "",
    size: "",
    soilType: "",
    waterSources: [] as string[],
    crops: [] as string[],
    cropHistory: "",
    fertilityLevel: "good",
    roadAccess: false,
    roadType: "",
    transportAccess: "",
    waterLevel: "",
    irrigationType: "",
    electricityAvailable: false,
    fertilizerPractices: "",
    pesticideHistory: "",
    soilTestSummary: "",
    drainageNotes: "",
    price: "",
    leaseDuration: "",
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const selectedFiles = Array.from(files).slice(0, 6 - images.length)
      setImageFiles(prev => [...prev, ...selectedFiles])
      setImages(prev => [...prev, ...selectedFiles.map(file => URL.createObjectURL(file))])
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const captureLandLocation = () => {
    setLocationError("")
    if (!navigator.geolocation) {
      setLocationError("Location services are unavailable in this browser.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      position => setFormData(current => ({
        ...current,
        latitude: position.coords.latitude.toFixed(6),
        longitude: position.coords.longitude.toFixed(6),
      })),
      () => setLocationError("Location permission was denied or the position could not be determined."),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }

  const submitListing = async () => {
    setSubmissionError("")
    if (!imageFiles.length || !ownershipProof || !formData.crops.length) {
      setSubmissionError("Add at least one crop, land photo, and ownership document before submitting.")
      return
    }
    setIsSubmitting(true)
    let createdLandId: string | null = null
    try {
      const land = await apiRequest<{ id: string }>("/lands", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          state: formData.state,
          district: formData.district,
          address: formData.address,
          latitude: formData.latitude ? Number(formData.latitude) : null,
          longitude: formData.longitude ? Number(formData.longitude) : null,
          size_acres: Number(formData.size),
          soil_type: formData.soilType,
          water_sources: formData.waterSources,
          crop_history: formData.cropHistory,
          crops: formData.crops,
          fertility_level: formData.fertilityLevel,
          annual_rent_per_acre_inr: Number(formData.price),
          lease_duration_months: Number(formData.leaseDuration),
          road_access: formData.roadAccess,
          road_type: formData.roadType,
          transport_access: formData.transportAccess,
          water_level: formData.waterLevel,
          irrigation_type: formData.irrigationType,
          electricity_available: formData.electricityAvailable,
          fertilizer_practices: formData.fertilizerPractices,
          pesticide_history: formData.pesticideHistory,
          soil_test_summary: formData.soilTestSummary,
          drainage_notes: formData.drainageNotes,
        }),
      })
      createdLandId = land.id

      const photos = new FormData()
      imageFiles.forEach(file => photos.append("files", file))
      await apiRequest(`/lands/${land.id}/photos`, { method: "POST", body: photos })

      const proof = new FormData()
      proof.append("kind", "land_ownership")
      proof.append("land_id", land.id)
      proof.append("file", ownershipProof)
      await apiRequest("/users/me/documents", { method: "POST", body: proof })
      router.push("/dashboard/owner")
    } catch (cause) {
      if (createdLandId) {
        await apiRequest(`/lands/${createdLandId}`, { method: "DELETE" }).catch(() => undefined)
      }
      setSubmissionError(cause instanceof Error ? cause.message : "Unable to submit the listing")
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              List Your <span className="text-gradient">Agricultural Land</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Connect with farmers and turn your unused land into income
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                    currentStep >= step.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden sm:block w-16 md:w-24 h-1 mx-2 rounded ${
                      currentStep > step.id ? "bg-primary" : "bg-secondary"
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground mt-2">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card">
              <CardContent className="p-8">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <Label htmlFor="title" className="text-base">Land Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Premium Farmland in Karnataka"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-2 h-12 bg-secondary border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-base">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your land, its features, and what makes it special..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-2 min-h-[150px] bg-secondary border-border"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Location */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="state" className="text-base">State *</Label>
                        <Select
                          value={formData.state}
                          onValueChange={(value) => setFormData({ ...formData, state: value })}
                        >
                          <SelectTrigger className="mt-2 h-12 bg-secondary border-border">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Karnataka", "Punjab", "Maharashtra", "Tamil Nadu", "Kerala", "Andhra Pradesh", "Gujarat", "Rajasthan", "Uttar Pradesh", "Madhya Pradesh"].map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="district" className="text-base">District *</Label>
                        <Input
                          id="district"
                          placeholder="e.g., Hassan"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          className="mt-2 h-12 bg-secondary border-border"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-base">Full Address *</Label>
                      <Textarea
                        id="address"
                        placeholder="Village, Taluk, and any landmarks..."
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="mt-2 min-h-[100px] bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-4 rounded-lg border border-border bg-secondary/50 p-4">
                      <div><p className="font-medium">Land map pin</p><p className="text-sm text-muted-foreground">Use the device location while at the property, or enter its coordinates. The exact pin stays private until a farmer unlocks contact.</p></div>
                      <Button type="button" variant="outline" onClick={captureLandLocation}><MapPin className="mr-2 h-4 w-4" />Use this device location</Button>
                      {locationError && <p role="alert" className="text-sm text-red-500">{locationError}</p>}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div><Label htmlFor="latitude">Latitude</Label><Input id="latitude" type="number" step="any" value={formData.latitude} onChange={event => setFormData({ ...formData, latitude: event.target.value })} placeholder="e.g., 13.0827" className="mt-2 bg-background" /></div>
                        <div><Label htmlFor="longitude">Longitude</Label><Input id="longitude" type="number" step="any" value={formData.longitude} onChange={event => setFormData({ ...formData, longitude: event.target.value })} placeholder="e.g., 77.5946" className="mt-2 bg-background" /></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Land Details */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="size" className="text-base">Land Size (Acres) *</Label>
                        <Input
                          id="size"
                          type="number"
                          placeholder="e.g., 25"
                          value={formData.size}
                          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                          className="mt-2 h-12 bg-secondary border-border"
                        />
                      </div>
                      <div>
                        <Label htmlFor="soilType" className="text-base">Soil Type *</Label>
                        <Select
                          value={formData.soilType}
                          onValueChange={(value) => setFormData({ ...formData, soilType: value })}
                        >
                          <SelectTrigger className="mt-2 h-12 bg-secondary border-border">
                            <SelectValue placeholder="Select soil type" />
                          </SelectTrigger>
                          <SelectContent>
                            {soilTypes.map((soil) => (
                              <SelectItem key={soil} value={soil}>{soil}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-base">Water Sources *</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {waterSources.map((source) => (
                          <Button
                            key={source}
                            type="button"
                            variant={formData.waterSources.includes(source) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              if (formData.waterSources.includes(source)) {
                                setFormData({
                                  ...formData,
                                  waterSources: formData.waterSources.filter(s => s !== source)
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  waterSources: [...formData.waterSources, source]
                                })
                              }
                            }}
                            className={formData.waterSources.includes(source) ? "bg-primary text-primary-foreground" : "neon-border"}
                          >
                            <Droplets className="h-4 w-4 mr-1" />
                            {source}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base">Main crops grown *</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {cropTypes.map(crop => <Button
                          key={crop}
                          type="button"
                          size="sm"
                          variant={formData.crops.includes(crop) ? "default" : "outline"}
                          onClick={() => setFormData({
                            ...formData,
                            crops: formData.crops.includes(crop)
                              ? formData.crops.filter(item => item !== crop)
                              : [...formData.crops, crop],
                          })}
                        >{crop}</Button>)}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cropHistory" className="text-base">Previous Crop History</Label>
                      <Textarea
                        id="cropHistory"
                        placeholder="What crops have been grown on this land before?"
                        value={formData.cropHistory}
                        onChange={(e) => setFormData({ ...formData, cropHistory: e.target.value })}
                        className="mt-2 min-h-[100px] bg-secondary border-border"
                      />
                    </div>

                    <div>
                      <Label className="text-base">Fertility Level *</Label>
                      <div className="flex gap-4 mt-2">
                        {["excellent", "good", "average", "needs improvement"].map((level) => (
                          <Button
                            key={level}
                            type="button"
                            variant={formData.fertilityLevel === level ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFormData({ ...formData, fertilityLevel: level })}
                            className={`capitalize ${formData.fertilityLevel === level ? "bg-primary text-primary-foreground" : "neon-border"}`}
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div><Label htmlFor="irrigationType">Irrigation method</Label><Input id="irrigationType" value={formData.irrigationType} onChange={event => setFormData({ ...formData, irrigationType: event.target.value })} placeholder="Drip, canal, borewell..." /></div>
                      <div className="flex items-center gap-3 rounded-md border border-border p-3"><Checkbox id="electricityAvailable" checked={formData.electricityAvailable} onCheckedChange={checked => setFormData({ ...formData, electricityAvailable: checked === true })} /><Label htmlFor="electricityAvailable">Electricity available on the land</Label></div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div><Label htmlFor="fertilizerPractices">Fertilizers and soil amendments used</Label><Textarea id="fertilizerPractices" value={formData.fertilizerPractices} onChange={event => setFormData({ ...formData, fertilizerPractices: event.target.value })} maxLength={2000} placeholder="List products or organic inputs and approximate use" /></div>
                      <div><Label htmlFor="pesticideHistory">Pesticide and herbicide history</Label><Textarea id="pesticideHistory" value={formData.pesticideHistory} onChange={event => setFormData({ ...formData, pesticideHistory: event.target.value })} maxLength={2000} placeholder="Products and recent application dates, if known" /></div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div><Label htmlFor="soilTestSummary">Soil test results</Label><Textarea id="soilTestSummary" value={formData.soilTestSummary} onChange={event => setFormData({ ...formData, soilTestSummary: event.target.value })} maxLength={2000} placeholder="Add date, lab, pH, NPK, and attach supporting details in the description" /></div>
                      <div><Label htmlFor="drainageNotes">Drainage and seasonal risks</Label><Textarea id="drainageNotes" value={formData.drainageNotes} onChange={event => setFormData({ ...formData, drainageNotes: event.target.value })} maxLength={1000} placeholder="Flooding, waterlogging, or drainage observations" /></div>
                    </div>

                    <div className="space-y-4 rounded-lg border border-border p-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="roadAccess"
                          checked={formData.roadAccess}
                          onCheckedChange={(checked) => setFormData({ ...formData, roadAccess: checked === true })}
                        />
                        <Label htmlFor="roadAccess" className="text-base">Vehicle road access reaches the land</Label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="roadType">Road type</Label>
                          <Input id="roadType" placeholder="Paved, gravel, dirt..." value={formData.roadType} onChange={(e) => setFormData({ ...formData, roadType: e.target.value })} className="mt-2 bg-secondary border-border" />
                        </div>
                        <div>
                          <Label htmlFor="waterLevel">Water availability</Label>
                          <Select value={formData.waterLevel} onValueChange={(value) => setFormData({ ...formData, waterLevel: value })}>
                            <SelectTrigger id="waterLevel" className="mt-2 bg-secondary border-border"><SelectValue placeholder="Select availability" /></SelectTrigger>
                            <SelectContent>
                              {waterLevels.map(level => <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="transportAccess">Transport and nearest road details</Label>
                        <Textarea id="transportAccess" placeholder="Nearest road, vehicle access, distance to transport or market..." value={formData.transportAccess} onChange={(e) => setFormData({ ...formData, transportAccess: e.target.value })} className="mt-2 min-h-[90px] bg-secondary border-border" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Images */}
                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <Label className="text-base">Land Images *</Label>
                      <p className="text-sm text-muted-foreground mt-1 mb-4">
                        Upload up to 6 high-quality images of your land
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative aspect-video rounded-lg overflow-hidden group">
                            <img src={image} alt={`Land ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        
                        {images.length < 6 && (
                          <label className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center transition-colors bg-secondary/50">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">Upload Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ownershipProof" className="text-base">Land ownership proof *</Label>
                      <p className="text-sm text-muted-foreground">This file is private and only available to the verification team. Do not upload Aadhaar.</p>
                      <Input id="ownershipProof" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setOwnershipProof(event.target.files?.[0] ?? null)} className="bg-secondary border-border" />
                      {ownershipProof && <p className="text-sm text-muted-foreground">Selected: {ownershipProof.name}</p>}
                    </div>

                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <h4 className="font-medium mb-2 text-foreground">Image Tips</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Take photos during daylight for best quality</li>
                        <li>• Include images of water sources and soil</li>
                        <li>• Show access roads and boundaries</li>
                        <li>• Capture any existing structures or facilities</li>
                      </ul>
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Pricing */}
                {currentStep === 5 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="price" className="text-base">Annual Rent per Acre (₹) *</Label>
                        <div className="relative mt-2">
                          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="price"
                            type="number"
                            placeholder="e.g., 15000 per acre per year"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="h-12 pl-12 bg-secondary border-border"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="leaseDuration" className="text-base">Minimum Lease Duration *</Label>
                        <Select
                          value={formData.leaseDuration}
                          onValueChange={(value) => setFormData({ ...formData, leaseDuration: value })}
                        >
                          <SelectTrigger className="mt-2 h-12 bg-secondary border-border">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6">6 Months</SelectItem>
                            <SelectItem value="12">1 Year</SelectItem>
                            <SelectItem value="24">2 Years</SelectItem>
                            <SelectItem value="36">3 Years</SelectItem>
                            <SelectItem value="60">5 Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Preview Card */}
                    <div className="p-6 rounded-xl glass-card neon-border">
                      <h4 className="font-semibold mb-4 text-foreground">Listing Preview</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Title</p>
                          <p className="font-medium text-foreground">{formData.title || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-medium text-foreground">{formData.district}, {formData.state || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Size</p>
                          <p className="font-medium text-foreground">{formData.size ? `${formData.size} Acres` : "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-medium text-primary">{formData.price && formData.size ? `₹${Math.round(Number(formData.price) * Number(formData.size)).toLocaleString("en-IN")}/year` : "Not specified"}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                {submissionError && <p role="alert" className="mt-6 text-sm text-red-500">{submissionError}</p>}
                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    disabled={currentStep === 1}
                    className="neon-border"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  {currentStep < steps.length ? (
                    <Button
                      onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
                      className="bg-primary text-primary-foreground"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={submitListing} disabled={isSubmitting} className="bg-primary text-primary-foreground">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Submitting..." : "Submit Listing"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
