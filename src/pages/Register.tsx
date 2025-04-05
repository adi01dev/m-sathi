
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useForm, Controller } from 'react-hook-form';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  occupation: 'student' | 'professional' | 'other';
  healthStatus: string;
  goals: string[];
}

const wellnessGoals = [
  { id: "reduce-stress", label: "Reduce stress and anxiety" },
  { id: "improve-sleep", label: "Improve sleep quality" },
  { id: "increase-mindfulness", label: "Practice mindfulness" },
  { id: "manage-emotions", label: "Better manage emotions" },
  { id: "build-resilience", label: "Build emotional resilience" },
  { id: "work-life-balance", label: "Improve work-life balance" },
  { id: "self-awareness", label: "Develop greater self-awareness" },
];

const Register = () => {
  const [step, setStep] = useState(1);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<RegisterFormData>();

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      navigate('/login');
    } catch (error) {
      // Error handling is done in the auth context
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 wellness-gradient">
      <Button 
        variant="ghost" 
        className="absolute top-4 left-4 flex gap-2 items-center"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Button>
      
      <Card className="w-full max-w-md shadow-xl animate-grow">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>
            {step === 1 ? "Basic information" : step === 2 ? "About you" : "Your wellness goals"}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Your name" 
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    {...register("password", { 
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>
              </>
            )}
            
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label>Occupation</Label>
                  <Controller
                    name="occupation"
                    control={control}
                    defaultValue="professional"
                    rules={{ required: "Please select your occupation" }}
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="student" id="student" />
                          <Label htmlFor="student">Student</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="professional" id="professional" />
                          <Label htmlFor="professional">Working Professional</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other">Other</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors.occupation && (
                    <p className="text-sm text-red-500">{errors.occupation.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="healthStatus">Current Health Status</Label>
                  <Textarea 
                    id="healthStatus"
                    placeholder="Briefly describe your current physical and mental health status"
                    {...register("healthStatus")}
                  />
                </div>
              </>
            )}
            
            {step === 3 && (
              <div className="space-y-4">
                <Label>What are your wellness goals? (Select all that apply)</Label>
                <div className="grid grid-cols-1 gap-2">
                  <Controller
                    name="goals"
                    control={control}
                    defaultValue={[]}
                    rules={{ required: "Please select at least one goal" }}
                    render={({ field }) => (
                      <>
                        {wellnessGoals.map((goal) => (
                          <div key={goal.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={goal.id}
                              checked={field.value?.includes(goal.label)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                if (checked) {
                                  field.onChange([...currentValue, goal.label]);
                                } else {
                                  field.onChange(
                                    currentValue.filter((value) => value !== goal.label)
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={goal.id} className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {goal.label}
                            </Label>
                          </div>
                        ))}
                      </>
                    )}
                  />
                </div>
                {errors.goals && (
                  <p className="text-sm text-red-500">{errors.goals.message}</p>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
            ) : (
              <Link to="/login" className="text-primary hover:underline text-sm">
                Already have an account?
              </Link>
            )}
            
            {step < 3 ? (
              <Button type="button" onClick={nextStep}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
