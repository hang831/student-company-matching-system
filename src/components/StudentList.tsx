
import { useState } from "react";
import { useInternshipSystem } from "@/hooks/useInternshipSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Star, IdCard, Phone, BookOpen, Plus, Edit, Trash, Upload, FileSpreadsheet } from "lucide-react";
import { Student, PreferenceImportData } from "@/types";
import { downloadTemplate, generatePreferencesTemplate, parseCSV, mapCSVToPreferencesData } from "@/utils/excelUtils";

const StudentList = () => {
  const { students, companies, addStudentPreference, updateStudent, addStudent, deleteStudent, importPreferences } = useInternshipSystem();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedStudent, setEditedStudent] = useState<Student | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [maxPreferences, setMaxPreferences] = useState(5);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    studentId: "",
    tel: "",
    gpa: "",
  });
  
  const handlePreferenceChange = (companyId: string, value: string) => {
    if (selectedStudent) {
      // If value is empty string, reset preference (rank 0 will be handled in useInternshipSystem)
      const rank = value === "" ? 0 : parseInt(value, 10);
      
      addStudentPreference({
        studentId: selectedStudent.id,
        companyId,
        rank,
      });
      
      // Make a new selection of the student to refresh the data
      const updatedStudent = students.find(s => s.id === selectedStudent.id);
      if (updatedStudent) {
        setSelectedStudent(updatedStudent);
      }
    }
  };

  // Get preference rank for a company (if exists)
  const getPreferenceRank = (studentId: string, companyId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return null;
    
    const preference = student.preferences.find(p => p.companyId === companyId);
    return preference ? preference.rank : null;
  };

  const handleEdit = (student: Student) => {
    setEditedStudent({...student});
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    if (editedStudent) {
      updateStudent(editedStudent);
      setEditMode(false);
      setEditedStudent(null);
    }
  };

  const handleAddStudent = () => {
    if (newStudent.name && newStudent.email && newStudent.studentId && newStudent.gpa) {
      addStudent(newStudent);
      setNewStudent({
        name: "",
        email: "",
        studentId: "",
        tel: "",
        gpa: "",
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteStudent = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };
  
  const handleDownloadPreferencesTemplate = () => {
    const template = generatePreferencesTemplate();
    downloadTemplate(template, "preferences_template.csv");
  };
  
  const handleImportPreferences = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const parsedData = parseCSV(csvContent);
        const preferencesData = mapCSVToPreferencesData(parsedData);
        importPreferences(preferencesData);
        setIsImportDialogOpen(false);
        if (e.target) {
          (e.target as any).value = '';
        }
      } catch (error) {
        console.error("Import error:", error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Students</h2>
        <div className="flex gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Preferences
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Student Preferences</DialogTitle>
                <DialogDescription>
                  Upload a CSV file to import student preferences in bulk.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div>
                  <Label htmlFor="preferencesFile">Select CSV File</Label>
                  <input
                    type="file"
                    id="preferencesFile"
                    accept=".csv"
                    onChange={handleImportPreferences}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 mt-1"
                  />
                </div>
                <div>
                  <p className="text-sm mb-2">Need a template?</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownloadPreferencesTemplate}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Download Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>Complete the form to add a new student.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    value={newStudent.name}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStudent.email}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="studentId">Student ID <span className="text-red-500">*</span></Label>
                  <Input
                    id="studentId"
                    value={newStudent.studentId}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, studentId: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tel">Telephone (Optional)</Label>
                  <Input
                    id="tel"
                    value={newStudent.tel}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, tel: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gpa">GPA <span className="text-red-500">*</span></Label>
                  <Input
                    id="gpa"
                    value={newStudent.gpa}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, gpa: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddStudent}
                disabled={!newStudent.name || !newStudent.email || !newStudent.studentId || !newStudent.gpa}
              >
                Add Student
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <Card 
            key={student.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium">{student.name}</CardTitle>
              <User className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground flex items-center">
                  <IdCard className="h-4 w-4 mr-2" />
                  ID: {student.studentId}
                </p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Tel: {student.tel}
                </p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  GPA: {student.gpa}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {companies.map((company) => {
                  const rank = getPreferenceRank(student.id, company.id);
                  return rank ? (
                    <div 
                      key={company.id}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                    >
                      {company.name}: {rank} <Star className="h-3 w-3 ml-1 fill-current" />
                    </div>
                  ) : null;
                })}
              </div>
              <div className="flex space-x-2 mt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStudentToDelete(student);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the student "{student.name}" and all associated preferences.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setStudentToDelete(null)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteStudent} className="bg-red-500 hover:bg-red-700">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(student);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit Details
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStudent(student);
                  }}
                >
                  <Star className="h-4 w-4 mr-1" /> Set Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedStudent && (
        <Dialog open={!!selectedStudent && !editMode} onOpenChange={(open) => !open && setSelectedStudent(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Student Preferences</DialogTitle>
              <DialogDescription>Set your company preferences</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <h3 className="text-lg font-medium mb-2">{selectedStudent.name}</h3>
              <div className="space-y-1 mb-4">
                <p className="text-sm text-muted-foreground flex items-center">
                  <IdCard className="h-4 w-4 mr-2" />
                  ID: {selectedStudent.studentId}
                </p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Tel: {selectedStudent.tel}
                </p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  GPA: {selectedStudent.gpa}
                </p>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="maxPreferences">Max Preferences:</Label>
                  <Select 
                    value={maxPreferences.toString()} 
                    onValueChange={(value) => setMaxPreferences(parseInt(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="Max" />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Preference Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`rank-${company.id}`} className="w-20">
                            Rank:
                          </Label>
                          <Select 
                            value={getPreferenceRank(selectedStudent.id, company.id)?.toString() || ""}
                            onValueChange={(value) => handlePreferenceChange(company.id, value)}
                          >
                            <SelectTrigger id={`rank-${company.id}`} className="w-24">
                              <SelectValue placeholder="Rank" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
                              {[...Array(maxPreferences)].map((_, i) => (
                                <SelectItem key={i+1} value={(i+1).toString()}>
                                  {i+1} {i === 0 ? "(Top)" : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button onClick={() => setSelectedStudent(null)}>Close</Button>
          </DialogContent>
        </Dialog>
      )}

      {editMode && editedStudent && (
        <Dialog open={editMode} onOpenChange={(open) => !open && setEditMode(false)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>Update student information</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={editedStudent.name}
                  onChange={(e) => setEditedStudent({...editedStudent, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  value={editedStudent.email}
                  onChange={(e) => setEditedStudent({...editedStudent, email: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="studentId">Student ID <span className="text-red-500">*</span></Label>
                <Input
                  id="studentId"
                  value={editedStudent.studentId}
                  onChange={(e) => setEditedStudent({...editedStudent, studentId: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tel">Telephone (Optional)</Label>
                <Input
                  id="tel"
                  value={editedStudent.tel}
                  onChange={(e) => setEditedStudent({...editedStudent, tel: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gpa">GPA <span className="text-red-500">*</span></Label>
                <Input
                  id="gpa"
                  value={editedStudent.gpa}
                  onChange={(e) => setEditedStudent({...editedStudent, gpa: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
              <Button 
                onClick={handleSaveEdit} 
                disabled={!editedStudent.name || !editedStudent.email || !editedStudent.studentId || !editedStudent.gpa}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StudentList;
