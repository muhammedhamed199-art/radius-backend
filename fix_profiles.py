with open('src/components/DistributorsView.tsx', 'r') as f:
    content = f.read()

target = """      )}
    </div>
  );
}"""

replacement = """      )}

      {showProfilesModal && (
        <PermissionProfilesModal
          profiles={settings?.permissionProfiles || []}
          onSaveProfiles={(profiles) => onUpdateSettings({ ...settings, permissionProfiles: profiles })}
          onClose={() => setShowProfilesModal(false)}
        />
      )}
    </div>
  );
}"""

content = content.replace(target, replacement)

with open('src/components/DistributorsView.tsx', 'w') as f:
    f.write(content)
