// Code generated by protoc-gen-go. DO NOT EDIT.
// source: protobuf/redemptioninfo.proto

package protobuf

import (
	fmt "fmt"
	proto "github.com/golang/protobuf/proto"
	math "math"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.ProtoPackageIsVersion2 // please upgrade the proto package

// Database key is the redemptionKey
type RedemptionInfo struct {
	TemplateFlowerID     int64    `protobuf:"varint,1,opt,name=templateFlowerID,proto3" json:"templateFlowerID,omitempty"`
	Account              string   `protobuf:"bytes,2,opt,name=account,proto3" json:"account,omitempty"`
	Email                string   `protobuf:"bytes,3,opt,name=email,proto3" json:"email,omitempty"`
	PartnerAffiliate     string   `protobuf:"bytes,4,opt,name=partnerAffiliate,proto3" json:"partnerAffiliate,omitempty"`
	DateRedeemed         int64    `protobuf:"varint,5,opt,name=dateRedeemed,proto3" json:"dateRedeemed,omitempty"`
	ExpiryDate           int64    `protobuf:"varint,6,opt,name=expiryDate,proto3" json:"expiryDate,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-" datastore:"-"`
	XXX_unrecognized     []byte   `json:"-" datastore:"-"`
	XXX_sizecache        int32    `json:"-" datastore:"-"`
}

func (m *RedemptionInfo) Reset()         { *m = RedemptionInfo{} }
func (m *RedemptionInfo) String() string { return proto.CompactTextString(m) }
func (*RedemptionInfo) ProtoMessage()    {}
func (*RedemptionInfo) Descriptor() ([]byte, []int) {
	return fileDescriptor_0a9253bf46a997f3, []int{0}
}

func (m *RedemptionInfo) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_RedemptionInfo.Unmarshal(m, b)
}
func (m *RedemptionInfo) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_RedemptionInfo.Marshal(b, m, deterministic)
}
func (m *RedemptionInfo) XXX_Merge(src proto.Message) {
	xxx_messageInfo_RedemptionInfo.Merge(m, src)
}
func (m *RedemptionInfo) XXX_Size() int {
	return xxx_messageInfo_RedemptionInfo.Size(m)
}
func (m *RedemptionInfo) XXX_DiscardUnknown() {
	xxx_messageInfo_RedemptionInfo.DiscardUnknown(m)
}

var xxx_messageInfo_RedemptionInfo proto.InternalMessageInfo

func (m *RedemptionInfo) GetTemplateFlowerID() int64 {
	if m != nil {
		return m.TemplateFlowerID
	}
	return 0
}

func (m *RedemptionInfo) GetAccount() string {
	if m != nil {
		return m.Account
	}
	return ""
}

func (m *RedemptionInfo) GetEmail() string {
	if m != nil {
		return m.Email
	}
	return ""
}

func (m *RedemptionInfo) GetPartnerAffiliate() string {
	if m != nil {
		return m.PartnerAffiliate
	}
	return ""
}

func (m *RedemptionInfo) GetDateRedeemed() int64 {
	if m != nil {
		return m.DateRedeemed
	}
	return 0
}

func (m *RedemptionInfo) GetExpiryDate() int64 {
	if m != nil {
		return m.ExpiryDate
	}
	return 0
}

func init() {
	proto.RegisterType((*RedemptionInfo)(nil), "protobuf.RedemptionInfo")
}

func init() { proto.RegisterFile("protobuf/redemptioninfo.proto", fileDescriptor_0a9253bf46a997f3) }

var fileDescriptor_0a9253bf46a997f3 = []byte{
	// 198 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x64, 0x8f, 0x4d, 0x6a, 0xc3, 0x30,
	0x10, 0x85, 0x51, 0x5d, 0xbb, 0xed, 0x50, 0x4a, 0x11, 0x5d, 0x68, 0xd3, 0x62, 0xbc, 0x32, 0x5d,
	0x24, 0x8b, 0x9c, 0x20, 0x60, 0x02, 0xde, 0xfa, 0x06, 0xb2, 0x3d, 0x02, 0x81, 0xfe, 0x10, 0x63,
	0x92, 0xdc, 0x35, 0x87, 0x09, 0x56, 0x70, 0x48, 0xf0, 0xf2, 0x7d, 0xf3, 0xf1, 0x78, 0x03, 0xbf,
	0x21, 0x7a, 0xf2, 0xfd, 0xa4, 0xb6, 0x11, 0x47, 0xb4, 0x81, 0xb4, 0x77, 0xda, 0x29, 0xbf, 0x49,
	0x9c, 0xbf, 0x2f, 0xe7, 0xea, 0xc2, 0xe0, 0xab, 0xbb, 0x2b, 0xad, 0x53, 0x9e, 0xff, 0xc3, 0x37,
	0xa1, 0x0d, 0x46, 0x12, 0x1e, 0x8c, 0x3f, 0x62, 0x6c, 0x1b, 0xc1, 0x4a, 0x56, 0x67, 0xdd, 0x8a,
	0x73, 0x01, 0x6f, 0x72, 0x18, 0xfc, 0xe4, 0x48, 0xbc, 0x94, 0xac, 0xfe, 0xe8, 0x96, 0xc8, 0x7f,
	0x20, 0x47, 0x2b, 0xb5, 0x11, 0x59, 0xe2, 0xb7, 0x30, 0x77, 0x07, 0x19, 0xc9, 0x61, 0xdc, 0x2b,
	0xa5, 0x8d, 0x96, 0x84, 0xe2, 0x35, 0x09, 0x2b, 0xce, 0x2b, 0xf8, 0x1c, 0x25, 0xe1, 0xbc, 0x0e,
	0x2d, 0x8e, 0x22, 0x4f, 0x1b, 0x9e, 0x18, 0xff, 0x03, 0xc0, 0x53, 0xd0, 0xf1, 0xdc, 0xcc, 0x4d,
	0x45, 0x32, 0x1e, 0x48, 0x5f, 0xa4, 0x47, 0x77, 0xd7, 0x00, 0x00, 0x00, 0xff, 0xff, 0x34, 0xee,
	0x00, 0x59, 0x10, 0x01, 0x00, 0x00,
}
