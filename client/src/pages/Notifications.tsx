
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useAuth } from "@/lib/stores/auth-store";
import { useExams } from "@/lib/stores/exams-store";
import { format } from "date-fns";
import { 
  CalendarIcon, 
  FileTextIcon, 
  BellIcon, 
  CheckIcon, 
  XIcon,
  BellOffIcon
} from "lucide-react";
type NotificationType = "exam" | "document" | "system";
type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: Date;
};

const Notifications = () => {
  const { isAuthenticated } = useAuth();
  const { exams, mySubscriptions, fetchExams, fetchSubscriptions } = useExams();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!exams.length) {
      fetchExams();
    }
    fetchSubscriptions();
  }, [exams.length, fetchExams, fetchSubscriptions]);

  const notifications = useMemo<NotificationItem[]>(() => {
    const now = new Date();
    const items: NotificationItem[] = [];
    
    // Get subscribed exams from the subscription objects
    const subscribedExamIds = mySubscriptions.map(sub => sub.examId);
    const subscribed = exams.filter((e) => subscribedExamIds.includes(e.id));

    subscribed.forEach((exam) => {
      const regStart = new Date(exam.registrationStartDate);
      const regEnd = new Date(exam.registrationEndDate);
      const examDate = exam.examDate ? new Date(exam.examDate) : undefined;

      // Registration opens within 14 days
      if (regStart > now) {
        const days = Math.ceil((regStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (days <= 14) {
          items.push({
            id: `${exam.id}-reg-open`,
            type: "exam",
            title: `${exam.name}: Registration opens soon`,
            message: `Registration opens on ${format(regStart, "MMM d, yyyy")}`,
            date: regStart,
          });
        }
      }

      // Registration closing within 7 days
      if (regEnd >= now) {
        const daysLeft = Math.ceil((regEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 7) {
          items.push({
            id: `${exam.id}-reg-close`,
            type: "exam",
            title: `${exam.name}: Registration closing soon`,
            message: `Registration closes on ${format(regEnd, "MMM d, yyyy")}`,
            date: regEnd,
          });
        }
      }

      // Upcoming exam date within 30 days
      if (examDate && examDate > now) {
        const days = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (days <= 30) {
          items.push({
            id: `${exam.id}-exam-date`,
            type: "exam",
            title: `${exam.name}: Exam coming up`,
            message: `Exam on ${format(examDate, "MMM d, yyyy")}`,
            date: examDate,
          });
        }
      }
    });

    // Sort newest first by date desc
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [exams, mySubscriptions]);
  const navigate = useNavigate();
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "exam":
        return <CalendarIcon className="h-5 w-5 text-blue-500" />;
      case "document":
        return <FileTextIcon className="h-5 w-5 text-green-500" />;
      case "system":
        return <BellIcon className="h-5 w-5 text-amber-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-primary" />;
    }
  };

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground mt-1">
                Stay updated with important information and alerts
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <CheckIcon className="h-4 w-4" />
                Mark All as Read
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 h-auto p-1">
              <TabsTrigger value="all" className="py-2">
                All
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="exams" className="py-2">Exams</TabsTrigger>
              <TabsTrigger value="documents" className="py-2">Documents</TabsTrigger>
              <TabsTrigger value="system" className="py-2">System</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <Card key={notification.id} className={`transition-all ${!readIds.has(notification.id) ? "border-l-4 border-l-primary" : ""}`}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-background p-2 border">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{notification.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {format(notification.date, "MMM d, yyyy")}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setReadIds((prev) => new Set(prev).add(notification.id))}
                                aria-label="Dismiss"
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <BellOffIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No notifications</h3>
                  <p className="text-muted-foreground max-w-sm">
                    You're all caught up! We'll notify you when there's something new.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="exams" className="space-y-4">
              {notifications.filter(n => n.type === "exam").length > 0 ? (
                notifications
                  .filter(n => n.type === "exam")
                  .map((notification) => (
                    <Card key={notification.id} className={`transition-all ${!readIds.has(notification.id) ? "border-l-4 border-l-primary" : ""}`}>
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-background p-2 border">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{notification.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {notification.message}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {format(notification.date, "MMM d, yyyy")}
                                </span>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setReadIds((prev) => new Set(prev).add(notification.id))}>
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No exam notifications</h3>
                  <p className="text-muted-foreground max-w-sm">
                    You don't have any exam-related notifications at the moment.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              {notifications.filter(n => n.type === "document").length > 0 ? (
                notifications
                  .filter(n => n.type === "document")
                  .map((notification) => (
                    <Card key={notification.id} className={`transition-all ${!readIds.has(notification.id) ? "border-l-4 border-l-primary" : ""}`}>
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-background p-2 border">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{notification.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {notification.message}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {format(notification.date, "MMM d, yyyy")}
                                </span>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setReadIds((prev) => new Set(prev).add(notification.id))}>
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <FileTextIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No document notifications</h3>
                  <p className="text-muted-foreground max-w-sm">
                    You don't have any document-related notifications at the moment.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="system" className="space-y-4">
              {notifications.filter(n => n.type === "system").length > 0 ? (
                notifications
                  .filter(n => n.type === "system")
                  .map((notification) => (
                    <Card key={notification.id} className={`transition-all ${!readIds.has(notification.id) ? "border-l-4 border-l-primary" : ""}`}>
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-background p-2 border">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{notification.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {notification.message}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {format(notification.date, "MMM d, yyyy")}
                                </span>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setReadIds((prev) => new Set(prev).add(notification.id))}>
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <BellIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No system notifications</h3>
                  <p className="text-muted-foreground max-w-sm">
                    You don't have any system-related notifications at the moment.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Notifications;
