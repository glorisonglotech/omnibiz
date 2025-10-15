# Profile.jsx - Missing Tab Contents Code

**File:** `client/src/pages/dashboard/Profile.jsx`  
**Insert Location:** After line 1109 (after `</TabsContent>` for Overview tab)

---

## Complete Code to Insert

```jsx
          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Detailed information about you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={profileData.jobTitle}
                        onChange={(e) => setProfileData({...profileData, jobTitle: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={profileData.department}
                        onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        rows={4}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.jobTitle || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.department || 'Not provided'}</span>
                    </div>
                    {profileData.bio && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">{profileData.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Skills & Expertise
                </CardTitle>
                <CardDescription>Your professional skills and competencies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {skillsData.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{skill.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">{skill.category}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                    {isEditing && (
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[skill.level]}
                          onValueChange={([value]) => updateSkillLevel(skill.name, value)}
                          max={100}
                          step={5}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkill(skill.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const skillName = prompt('Enter skill name:');
                      if (skillName) addSkill(skillName, 50);
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your recent actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {activityData.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`p-2 rounded-full ${activity.color} bg-opacity-10`}>
                          <activity.icon className={`h-4 w-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Professional Network
                </CardTitle>
                <CardDescription>Your connections and colleagues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connectionsData.map((connection) => (
                    <div key={connection.id} className="flex items-center gap-3 p-4 rounded-lg border">
                      <Avatar>
                        <AvatarImage src={connection.avatar} />
                        <AvatarFallback>{connection.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{connection.name}</p>
                        <p className="text-xs text-muted-foreground">{connection.role}</p>
                        <p className="text-xs text-muted-foreground">{connection.mutual} mutual connections</p>
                      </div>
                      <Button
                        variant={connection.connected ? "outline" : "default"}
                        size="sm"
                      >
                        {connection.connected ? 'Connected' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
                <CardDescription>Manage your profile preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email updates</p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => setPreferences({...preferences, emailNotifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications</p>
                  </div>
                  <Switch
                    checked={preferences.pushNotifications}
                    onCheckedChange={(checked) => setPreferences({...preferences, pushNotifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                  </div>
                  <Select
                    value={preferences.profileVisibility}
                    onValueChange={(value) => setPreferences({...preferences, profileVisibility: value})}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="connections">Connections Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Activity</Label>
                    <p className="text-sm text-muted-foreground">Display your activity on profile</p>
                  </div>
                  <Switch
                    checked={preferences.showActivity}
                    onCheckedChange={(checked) => setPreferences({...preferences, showActivity: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Online Status</Label>
                    <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                  </div>
                  <Switch
                    checked={preferences.showOnlineStatus}
                    onCheckedChange={(checked) => setPreferences({...preferences, showOnlineStatus: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
```

---

## Manual Implementation Steps

1. **Open the file:** `client/src/pages/dashboard/Profile.jsx`

2. **Locate line 1109:** Look for this line:
   ```jsx
           </TabsContent>
   ```
   (This is the closing tag for the Overview tab)

3. **Insert the code above** between line 1109 and line 1110

4. **Verify indentation:** Ensure the new code matches the surrounding indentation (10 spaces for `TabsContent`)

5. **Save the file**

6. **Test:** Navigate to the Profile page and click through each tab to ensure they render correctly

---

## Verification Checklist

- [ ] About tab displays personal information
- [ ] Skills tab shows skills with progress bars
- [ ] Activity tab shows recent activity feed
- [ ] Connections tab displays network
- [ ] Settings tab has working toggles
- [ ] Edit mode works for About and Skills tabs
- [ ] No console errors
- [ ] Responsive on mobile

---

**Note:** All required imports are already present in the file, so no additional imports are needed.
