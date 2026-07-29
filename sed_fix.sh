sed -i '745,860c\
            <DistributorPermissionsFilterable \
              permissions={modalPermissions} \
              onChange={setModalPermissions} \
              isModal={true} \
            />\
' src/components/DistributorsView.tsx
