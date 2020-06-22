// Code generated by protoc-gen-go. DO NOT EDIT.
// source: protobuf/dropperservice.proto

package protobuf

import (
	fmt "fmt"
	proto "github.com/golang/protobuf/proto"
	math "math"
)

import (
	context "golang.org/x/net/context"
	grpc "google.golang.org/grpc"
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

type DropRequest_Type int32

const (
	DropRequest_MARKET_FLOWER DropRequest_Type = 0
	DropRequest_ETHEREUM      DropRequest_Type = 1
	DropRequest_RANDOM_NFT    DropRequest_Type = 2
)

var DropRequest_Type_name = map[int32]string{
	0: "MARKET_FLOWER",
	1: "ETHEREUM",
	2: "RANDOM_NFT",
}

var DropRequest_Type_value = map[string]int32{
	"MARKET_FLOWER": 0,
	"ETHEREUM":      1,
	"RANDOM_NFT":    2,
}

func (x DropRequest_Type) String() string {
	return proto.EnumName(DropRequest_Type_name, int32(x))
}

func (DropRequest_Type) EnumDescriptor() ([]byte, []int) {
	return fileDescriptor_f092a0895a039f8d, []int{0, 0}
}

type DropRequest struct {
	UniqueID      string           `protobuf:"bytes,1,opt,name=unique_i_d,json=uniqueID,proto3" json:"unique_i_d,omitempty"`
	SourceAccount string           `protobuf:"bytes,2,opt,name=source_account,json=sourceAccount,proto3" json:"source_account,omitempty"`
	DestAccount   string           `protobuf:"bytes,3,opt,name=dest_account,json=destAccount,proto3" json:"dest_account,omitempty"`
	Type          DropRequest_Type `protobuf:"varint,4,opt,name=type,proto3,enum=protobuf.DropRequest_Type" json:"type,omitempty"`
	StoreDBID     int64            `protobuf:"varint,5,opt,name=store_d_b_i_d,json=storeDBID,proto3" json:"store_d_b_i_d,omitempty"`
	Wei           string           `protobuf:"bytes,6,opt,name=wei,proto3" json:"wei,omitempty"`
	// BELOW: supplemental data added for database record only
	FulfilmentTx         string   `protobuf:"bytes,7,opt,name=fulfilment_tx,json=fulfilmentTx,proto3" json:"fulfilment_tx,omitempty"`
	NFTContract          string   `protobuf:"bytes,8,opt,name=n_f_t_contract,json=nFTContract,proto3" json:"n_f_t_contract,omitempty"`
	NFTTokenID           int64    `protobuf:"varint,9,opt,name=n_f_t_token_i_d,json=nFTTokenID,proto3" json:"n_f_t_token_i_d,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-" datastore:"-"`
	XXX_unrecognized     []byte   `json:"-" datastore:"-"`
	XXX_sizecache        int32    `json:"-" datastore:"-"`
}

func (m *DropRequest) Reset()         { *m = DropRequest{} }
func (m *DropRequest) String() string { return proto.CompactTextString(m) }
func (*DropRequest) ProtoMessage()    {}
func (*DropRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_f092a0895a039f8d, []int{0}
}

func (m *DropRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_DropRequest.Unmarshal(m, b)
}
func (m *DropRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_DropRequest.Marshal(b, m, deterministic)
}
func (m *DropRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_DropRequest.Merge(m, src)
}
func (m *DropRequest) XXX_Size() int {
	return xxx_messageInfo_DropRequest.Size(m)
}
func (m *DropRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_DropRequest.DiscardUnknown(m)
}

var xxx_messageInfo_DropRequest proto.InternalMessageInfo

func (m *DropRequest) GetUniqueID() string {
	if m != nil {
		return m.UniqueID
	}
	return ""
}

func (m *DropRequest) GetSourceAccount() string {
	if m != nil {
		return m.SourceAccount
	}
	return ""
}

func (m *DropRequest) GetDestAccount() string {
	if m != nil {
		return m.DestAccount
	}
	return ""
}

func (m *DropRequest) GetType() DropRequest_Type {
	if m != nil {
		return m.Type
	}
	return DropRequest_MARKET_FLOWER
}

func (m *DropRequest) GetStoreDBID() int64 {
	if m != nil {
		return m.StoreDBID
	}
	return 0
}

func (m *DropRequest) GetWei() string {
	if m != nil {
		return m.Wei
	}
	return ""
}

func (m *DropRequest) GetFulfilmentTx() string {
	if m != nil {
		return m.FulfilmentTx
	}
	return ""
}

func (m *DropRequest) GetNFTContract() string {
	if m != nil {
		return m.NFTContract
	}
	return ""
}

func (m *DropRequest) GetNFTTokenID() int64 {
	if m != nil {
		return m.NFTTokenID
	}
	return 0
}

func init() {
	proto.RegisterEnum("protobuf.DropRequest_Type", DropRequest_Type_name, DropRequest_Type_value)
	proto.RegisterType((*DropRequest)(nil), "protobuf.DropRequest")
}

// Reference imports to suppress errors if they are not otherwise used.
var _ context.Context
var _ grpc.ClientConn

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
const _ = grpc.SupportPackageIsVersion4

// DropperClient is the client API for Dropper service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://godoc.org/google.golang.org/grpc#ClientConn.NewStream.
type DropperClient interface {
	Drop(ctx context.Context, in *DropRequest, opts ...grpc.CallOption) (*EmptyReply, error)
}

type dropperClient struct {
	cc *grpc.ClientConn
}

func NewDropperClient(cc *grpc.ClientConn) DropperClient {
	return &dropperClient{cc}
}

func (c *dropperClient) Drop(ctx context.Context, in *DropRequest, opts ...grpc.CallOption) (*EmptyReply, error) {
	out := new(EmptyReply)
	err := c.cc.Invoke(ctx, "/protobuf.Dropper/Drop", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// DropperServer is the server API for Dropper service.
type DropperServer interface {
	Drop(context.Context, *DropRequest) (*EmptyReply, error)
}

func RegisterDropperServer(s *grpc.Server, srv DropperServer) {
	s.RegisterService(&_Dropper_serviceDesc, srv)
}

func _Dropper_Drop_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(DropRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(DropperServer).Drop(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/protobuf.Dropper/Drop",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(DropperServer).Drop(ctx, req.(*DropRequest))
	}
	return interceptor(ctx, in, info, handler)
}

var _Dropper_serviceDesc = grpc.ServiceDesc{
	ServiceName: "protobuf.Dropper",
	HandlerType: (*DropperServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "Drop",
			Handler:    _Dropper_Drop_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "protobuf/dropperservice.proto",
}

func init() { proto.RegisterFile("protobuf/dropperservice.proto", fileDescriptor_f092a0895a039f8d) }

var fileDescriptor_f092a0895a039f8d = []byte{
	// 370 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x6c, 0x91, 0xcf, 0x8b, 0xd3, 0x40,
	0x14, 0x80, 0x37, 0x9b, 0xb8, 0x9b, 0xbe, 0x6d, 0x62, 0x1c, 0x14, 0x42, 0x59, 0x21, 0xb6, 0x08,
	0x3d, 0x45, 0x58, 0x11, 0xaf, 0x56, 0x93, 0x60, 0xd1, 0x6e, 0x61, 0x18, 0xf1, 0x38, 0xb4, 0xc9,
	0x04, 0x82, 0xcd, 0xcc, 0x74, 0x32, 0xd1, 0xe6, 0xe8, 0x7f, 0x2e, 0x99, 0xf4, 0x87, 0x87, 0xbd,
	0x3d, 0xbe, 0xf7, 0xc1, 0xfb, 0x98, 0x81, 0xd7, 0x52, 0x09, 0x2d, 0xb6, 0x6d, 0xf9, 0xae, 0x50,
	0x42, 0x4a, 0xa6, 0x1a, 0xa6, 0x7e, 0x57, 0x39, 0x8b, 0x0d, 0x47, 0xee, 0x69, 0x3d, 0xb9, 0x3f,
	0x8b, 0x47, 0x23, 0x17, 0x75, 0x2d, 0xf8, 0xe0, 0x4d, 0xff, 0xda, 0x70, 0x97, 0x28, 0x21, 0x31,
	0xdb, 0xb7, 0xac, 0xd1, 0xe8, 0x1e, 0xa0, 0xe5, 0xd5, 0xbe, 0x65, 0xb4, 0xa2, 0x45, 0x68, 0x45,
	0xd6, 0x7c, 0x84, 0xdd, 0x81, 0x2c, 0x13, 0xf4, 0x16, 0xfc, 0x46, 0xb4, 0x2a, 0x67, 0x74, 0x93,
	0xe7, 0xa2, 0xe5, 0x3a, 0xbc, 0x36, 0x86, 0x37, 0xd0, 0xc5, 0x00, 0xd1, 0x1b, 0x18, 0x17, 0xac,
	0xd1, 0x67, 0xc9, 0x36, 0xd2, 0x5d, 0xcf, 0x4e, 0x4a, 0x0c, 0x8e, 0xee, 0x24, 0x0b, 0x9d, 0xc8,
	0x9a, 0xfb, 0x0f, 0x93, 0xf8, 0x14, 0x19, 0xff, 0x17, 0x13, 0x93, 0x4e, 0x32, 0x6c, 0x3c, 0x14,
	0x81, 0xd7, 0x68, 0xa1, 0x18, 0x2d, 0xe8, 0xd6, 0xa4, 0x3d, 0x8b, 0xac, 0xb9, 0x8d, 0x47, 0x06,
	0x26, 0x9f, 0x97, 0x09, 0x0a, 0xc0, 0xfe, 0xc3, 0xaa, 0xf0, 0xc6, 0xdc, 0xea, 0x47, 0x34, 0x03,
	0xaf, 0x6c, 0x77, 0x65, 0xb5, 0xab, 0x19, 0xd7, 0x54, 0x1f, 0xc2, 0x5b, 0xb3, 0x1b, 0x5f, 0x20,
	0x39, 0xa0, 0x19, 0xf8, 0x9c, 0x96, 0x54, 0xd3, 0x5c, 0x70, 0xad, 0x36, 0xb9, 0x0e, 0xdd, 0xa1,
	0x96, 0x67, 0xe4, 0xcb, 0x11, 0xa1, 0x19, 0x3c, 0x1f, 0x24, 0x2d, 0x7e, 0x31, 0x6e, 0xee, 0x8f,
	0xcc, 0x7d, 0xe0, 0x19, 0x21, 0x3d, 0x5b, 0x26, 0xd3, 0x8f, 0xe0, 0xf4, 0xc1, 0xe8, 0x05, 0x78,
	0xab, 0x05, 0xfe, 0x96, 0x12, 0x9a, 0x7d, 0x5f, 0xff, 0x4c, 0x71, 0x70, 0x85, 0xc6, 0xe0, 0xa6,
	0xe4, 0x6b, 0x8a, 0xd3, 0x1f, 0xab, 0xc0, 0x42, 0x3e, 0x00, 0x5e, 0x3c, 0x26, 0xeb, 0x15, 0x7d,
	0xcc, 0x48, 0x70, 0xfd, 0xf0, 0x09, 0x6e, 0x93, 0xe1, 0x0f, 0xd1, 0x07, 0x70, 0xfa, 0x11, 0xbd,
	0x7a, 0xf2, 0x41, 0x26, 0x2f, 0x2f, 0x38, 0xad, 0xa5, 0xee, 0x30, 0x93, 0xbb, 0x6e, 0x7a, 0xb5,
	0xbd, 0x31, 0xf8, 0xfd, 0xbf, 0x00, 0x00, 0x00, 0xff, 0xff, 0x69, 0xa1, 0xf2, 0x3a, 0x15, 0x02,
	0x00, 0x00,
}
