
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Coins, Gift } from 'lucide-react';
import { rewardAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export function TokenWallet() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const tokenBalance = await rewardAPI.getTokenBalance('user-1');
        setBalance(tokenBalance);
      } catch (error) {
        console.error("Error fetching token balance:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load token balance.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [toast]);

  const handleRedeem = async (reward: string, amount: number) => {
    setRedeeming(true);
    try {
      const result = await rewardAPI.redeemTokens('user-1', amount, reward);
      
      if (result.success) {
        setBalance(result.newBalance);
        toast({
          title: "Tokens redeemed!",
          description: result.message,
        });
        setRedeemDialogOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Redemption failed",
          description: result.message,
        });
      }
    } catch (error) {
      console.error("Error redeeming tokens:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to redeem tokens. Please try again.",
      });
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Your Wellness Tokens
          </CardTitle>
          <CardDescription>Earn tokens by maintaining your streak and completing recommended activities</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="text-4xl font-bold text-yellow-500">{loading ? "..." : balance}</div>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Daily check-in: +5 tokens</p>
            <p>• Completing activities: +5 tokens each</p>
            <p>• 7 day streak: +15 bonus tokens</p>
            <p>• Community participation: +2 tokens per post</p>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => setRedeemDialogOpen(true)}
            disabled={balance < 50}
          >
            <Gift className="mr-2 h-4 w-4" />
            Redeem Tokens
          </Button>
        </CardFooter>
      </Card>
      
      <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem Your Wellness Tokens</DialogTitle>
            <DialogDescription>
              Choose a reward to redeem with your {balance} tokens
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader className="p-3">
                <CardTitle className="text-base">Premium Meditation Pack</CardTitle>
                <CardDescription>Access to 30 premium guided meditations</CardDescription>
              </CardHeader>
              <CardFooter className="p-3 pt-0">
                <Button
                  size="sm"
                  onClick={() => handleRedeem("Premium Meditation Pack", 50)}
                  disabled={balance < 50 || redeeming}
                >
                  Redeem for 50 tokens
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader className="p-3">
                <CardTitle className="text-base">Special Plant Unlocks</CardTitle>
                <CardDescription>Unique plant variations and styles</CardDescription>
              </CardHeader>
              <CardFooter className="p-3 pt-0">
                <Button
                  size="sm"
                  onClick={() => handleRedeem("Special Plant Unlocks", 75)}
                  disabled={balance < 75 || redeeming}
                >
                  Redeem for 75 tokens
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader className="p-3">
                <CardTitle className="text-base">Online Therapy Session</CardTitle>
                <CardDescription>One 30-minute session with a certified therapist</CardDescription>
              </CardHeader>
              <CardFooter className="p-3 pt-0">
                <Button
                  size="sm"
                  onClick={() => handleRedeem("Online Therapy Session", 100)}
                  disabled={balance < 100 || redeeming}
                >
                  Redeem for 100 tokens
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRedeemDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
